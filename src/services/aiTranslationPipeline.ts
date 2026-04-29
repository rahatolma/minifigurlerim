import OpenAI from 'openai';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';
import { validateOpenAIEnv } from '@/utils/env';
import { slugify } from '@/utils/helpers';
import { collectorEnglishRewritePrompt } from './aiPrompts/collectorEnglishRewritePrompt';

/**
 * Calculates a reliable MD5 hash for stringified JSON or plain text
 * This is used to determine if TR source has actually changed.
 */
export function generateSourceHash(sourceData: any): string {
  const str = typeof sourceData === 'string' ? sourceData : JSON.stringify(sourceData);
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Queues a translation job if the hash changed and manual override is not active.
 * Should be called synchronously from save actions.
 */
export async function queueTranslationJobIfNeeded(
  entityType: string,
  entityId: string,
  sourceData: any,
  currentHash: string | null,
  isManualOverride: boolean,
  forceRegenerate: boolean = false
) {
  const newHash = generateSourceHash(sourceData);

  if (!forceRegenerate) {
    if (isManualOverride) return { queued: false, reason: 'manual_override' };
    if (currentHash === newHash) return { queued: false, reason: 'hash_match' };
  }

  const supabaseAdmin = createAdminClient();

  // 1. Update the entity to 'queued' state
  const { error: entityError } = await supabaseAdmin
    .from(entityType)
    .update({ 
      en_translation_status: 'queued',
      en_source_hash: newHash, // Store the expected hash
      en_translation_error: null 
    })
    .eq('id', entityId);

  if (entityError) {
    console.error(`Failed to update ${entityType} status to queued:`, entityError);
    return { queued: false, error: entityError.message };
  }

  // 2. Insert into jobs table
  const { error: jobError } = await supabaseAdmin
    .from('translation_jobs')
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      source_locale: 'tr',
      target_locale: 'en',
      status: 'queued',
      source_hash: newHash
    });

  if (jobError) {
    console.error('Failed to create translation job:', jobError);
    // Best effort rollback
    await supabaseAdmin.from(entityType).update({ en_translation_status: 'failed', en_translation_error: jobError.message }).eq('id', entityId);
    return { queued: false, error: jobError.message };
  }

  // Fire and forget background processor trigger
  // Note: For local dev this expects localhost:3004 or similar, for production the absolute URL.
  // In a real Vercel environment without Absolute URL, we might trigger this via standard fetch to absolute origin.
  // For safety, we'll return queued: true and let the caller fire the fetch if possible, or we fire it if we have absolute URL.
  
  return { queued: true, hash: newHash };
}

/**
 * The actual AI Generation function called by the worker/job processor
 */
export async function processTranslationJob(jobId: string, entityType: string, entityId: string, expectedHash: string) {
  const supabaseAdmin = createAdminClient();

  try {
    // 1. Mark Job and Entity as generating
    await supabaseAdmin.from('translation_jobs').update({ status: 'generating', updated_at: new Date().toISOString() }).eq('id', jobId);
    await supabaseAdmin.from(entityType).update({ en_translation_status: 'generating' }).eq('id', entityId);

    // 2. Fetch Entity Data
    const { data: entityData, error: dbError } = await supabaseAdmin
      .from(entityType)
      .select("*")
      .eq("id", entityId)
      .single();

    if (dbError || !entityData) {
      throw new Error("Entity not found or DB error: " + (dbError?.message || ''));
    }

    // Double check if hash still matches (in case it was updated again before this job ran)
    // Actually, expectedHash from job vs currentHash could be compared, but we'll just process what we have.

    let openai: OpenAI;
    try {
      const { apiKey } = validateOpenAIEnv();
      openai = new OpenAI({ apiKey });
    } catch (envError: any) {
      throw new Error("Configuration Error: " + envError.message);
    }

    let userPrompt = "";
    let expectedFormat = "";

    // Adapt extraction logic based on entity type
    if (entityType === "series") {
      userPrompt = `Rewrite the following Turkish series data into English:\nTitle: ${entityData.title}\nCategory: ${entityData.category}\nContent Blocks (JSON): ${JSON.stringify(entityData.content_blocks || [])}\n`;
      expectedFormat = `{\n  "title_en": "English Title",\n  "slug_en": "SEO Slug",\n  "meta_title_en": "SEO Meta Title (Max 60 chars)",\n  "meta_description_en": "SEO Meta Description (Max 160 chars)",\n  "description_blocks_en": [/* EXACT STRUCTURAL COPY of the provided Content Blocks JSON array, with all Turkish string values translated to English. Keep all IDs, types, and object keys exactly the same. Do NOT change the structure. */]\n}`;
    } else {
      throw new Error("Unsupported entity type for translation pipeline.");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: collectorEnglishRewritePrompt },
        { 
          role: "user", 
          content: `${userPrompt}\n\nProvide the output in exactly this JSON structure:\n${expectedFormat}` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error("OpenAI returned empty response");
    }

    const parsedData = JSON.parse(aiResponse);

    // Schema Validation: Ensure English blocks match Turkish blocks structure
    if (entityData.content_blocks && Array.isArray(entityData.content_blocks)) {
      if (!parsedData.description_blocks_en || !Array.isArray(parsedData.description_blocks_en)) {
        throw new Error("AI output structure mismatch: description_blocks_en is missing or not an array");
      }
      if (parsedData.description_blocks_en.length !== entityData.content_blocks.length) {
        throw new Error(`AI output structure mismatch: block count differs (TR: ${entityData.content_blocks.length}, EN: ${parsedData.description_blocks_en.length})`);
      }
      for (let i = 0; i < entityData.content_blocks.length; i++) {
        if (parsedData.description_blocks_en[i].type !== entityData.content_blocks[i].type) {
          throw new Error(`AI output structure mismatch: block type differs at index ${i} (TR: ${entityData.content_blocks[i].type}, EN: ${parsedData.description_blocks_en[i].type})`);
        }
      }
    }
    
    if (!parsedData.title_en || typeof parsedData.title_en !== 'string' || parsedData.title_en.trim() === '') {
      throw new Error("AI output validation failed: title_en is missing or empty");
    }
    if (!parsedData.slug_en || typeof parsedData.slug_en !== 'string' || parsedData.slug_en.trim() === '') {
      throw new Error("AI output validation failed: slug_en is missing or empty");
    }    // Slugification & Duplicate Checking
    const englishTitle = parsedData.slug_en || parsedData.title_en;
    if (englishTitle) {
      let baseSlug = slugify(englishTitle);
      let duplicateCheck = await supabaseAdmin
        .from(entityType)
        .select('id')
        .eq('slug_en', baseSlug)
        .not('id', 'eq', entityId)
        .maybeSingle();

      if (duplicateCheck.data) {
        baseSlug = `${baseSlug}-${entityId.split('-')[0]}`;
      }
      parsedData.slug_en = baseSlug;
    }

    // 3. Update the Target Entity with generated fields + Ready state
    const { error: updateError } = await supabaseAdmin
      .from(entityType)
      .update({
        ...parsedData,
        en_translation_status: 'ready',
        en_translation_error: null,
        en_source_hash: expectedHash // lock in the hash
      })
      .eq("id", entityId);

    if (updateError) {
      throw new Error("Failed to update entity database: " + updateError.message);
    }

    // 4. Mark job as completed
    await supabaseAdmin.from('translation_jobs').update({ 
      status: 'ready', 
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', jobId);

    return { success: true };

  } catch (error: any) {
    console.error(`Job [${jobId}] Error:`, error);
    // Mark Job as failed
    await supabaseAdmin.from('translation_jobs').update({ 
      status: 'failed', 
      error_message: error.message,
      updated_at: new Date().toISOString()
    }).eq('id', jobId);
    
    // Mark Entity as failed
    await supabaseAdmin.from(entityType).update({ 
      en_translation_status: 'failed',
      en_translation_error: error.message
    }).eq('id', entityId);

    return { success: false, error: error.message };
  }
}
