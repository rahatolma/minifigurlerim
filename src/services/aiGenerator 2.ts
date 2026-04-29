import OpenAI from 'openai';
import { createAdminClient } from '@/utils/supabase/admin';
import { validateOpenAIEnv } from '@/utils/env';
import { slugify } from '@/utils/helpers';

export async function generateENContent(entity_type: string, entity_id: string) {
  try {
    let openai: OpenAI;
    try {
      const { apiKey } = validateOpenAIEnv();
      openai = new OpenAI({ apiKey });
    } catch (envError: any) {
      throw new Error("Configuration Error: " + envError.message);
    }

    const supabaseAdmin = createAdminClient();

    const { data: entityData, error: dbError } = await supabaseAdmin
      .from(entity_type)
      .select("*")
      .eq("id", entity_id)
      .single();

    if (dbError || !entityData) {
      throw new Error("Entity not found or DB error: " + (dbError?.message || ''));
    }

    const systemPrompt = `
You are a professional editorial writer for a global LEGO minifigure collector platform. Your job is to rewrite content in fluent, authoritative English. You DO NOT translate.

RULES:
- DO NOT translate literally. Read the Turkish context and rewrite it as a high-quality English encyclopedia/database entry.
- DO NOT use childish or marketing language.
- DO NOT use words like: "cute", "adorable", "amazing", "buy now", "don't miss", "fun", "colorful".
- Use a neutral, editorial tone.
- Write like an archive / catalog / collector database.
- STYLE TARGET: concise, informative, credible, globally readable.
- The output MUST be a valid JSON object matching the requested schema.

If you see marketing hype in Turkish, strip it out and focus on the physical details, series context, and collector relevance.
`;

    let userPrompt = "";
    let expectedFormat = "";

    if (entity_type === "minifigures") {
      userPrompt = `Rewrite the following Turkish minifigure data into English:\nName: ${entityData.name}\nRole: ${entityData.figure_role || entityData.role}\nType: ${entityData.figure_type || entityData.type}\nDescription: ${entityData.description}\nShort Description: ${entityData.short_description_tr}\n`;
      expectedFormat = `{\n  "name_en": "English Name",\n  "role_en": "English Role",\n  "description_en": "Full English Description",\n  "short_description_en": "Short English Description",\n  "meta_title_en": "SEO Meta Title (Max 60 chars)",\n  "meta_description_en": "SEO Meta Description (Max 160 chars)"\n}`;
    } else if (entity_type === "series") {
      userPrompt = `Rewrite the following Turkish series data into English:\nTitle: ${entityData.title}\nCategory: ${entityData.category}\nSummary: ${entityData.summary_tr || ''}\nDescription: ${entityData.description || ''}\nCollector Comment: ${entityData.collector_comment_tr || ''}\nContent Blocks (JSON): ${JSON.stringify(entityData.content_blocks || [])}\n`;
      expectedFormat = `{\n  "title_en": "English Title",\n  "summary_en": "English Summary",\n  "meta_title_en": "SEO Meta Title (Max 60 chars)",\n  "meta_description_en": "SEO Meta Description (Max 160 chars)",\n  "collector_comment_en": "English Collector Comment",\n  "description_blocks_en": [{"type": "paragraph", "content": "English Content"}, {"type": "info", "content": "More info..."}]\n}`;
    } else if (entity_type === "news") {
      userPrompt = `Rewrite the following Turkish news data into English:\nTitle: ${entityData.title}\nSummary: ${entityData.summary}\nContent: ${entityData.content}\n`;
      expectedFormat = `{\n  "title_en": "English Title",\n  "editorial_slug_en": "Short SEO slug",\n  "summary_en": "English Summary",\n  "meta_title_en": "SEO Meta Title (Max 60 chars)",\n  "meta_description_en": "SEO Meta Description (Max 160 chars)",\n  "content_blocks_en": "Full English Content"\n}`;
    } else {
      throw new Error("Invalid entity_type");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
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

    // Slugification & Duplicate Checking
    const englishTitle = parsedData.editorial_slug_en || parsedData.title_en || parsedData.name_en;
    if (englishTitle) {
      let baseSlug = slugify(englishTitle);
      let duplicateCheck = await supabaseAdmin
        .from(entity_type)
        .select('id')
        .eq('slug_en', baseSlug)
        .not('id', 'eq', entity_id)
        .maybeSingle();

      if (duplicateCheck.data) {
        baseSlug = `${baseSlug}-${entity_id.split('-')[0]}`;
      }
      parsedData.slug_en = baseSlug;
    }
    
    // Set Status
    parsedData.en_status = 'draft';
    delete parsedData.editorial_slug_en;

    // Save back to DB
    const { error: updateError } = await supabaseAdmin
      .from(entity_type)
      .update(parsedData)
      .eq("id", entity_id);

    if (updateError) {
      throw new Error("Failed to update database: " + updateError.message);
    }

    return { success: true, data: parsedData };

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return { success: false, error: error.message };
  }
}
