import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function slugify(text) {
  if (!text) return '';
  const trMap = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'C', 'Ğ': 'G', 'I': 'I', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
  };
  let slug = text;
  for (let key in trMap) {
    slug = slug.replace(new RegExp(key, 'g'), trMap[key]);
  }
  return slug
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const failedItems = [];
const successItems = [];
const isTestMode = process.argv.includes('--test');

async function callOpenAIWithRetry(prompt, expectedFormat, maxRetries = 3) {
  let attempt = 1;
  for (; attempt <= maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${prompt}\n\nProvide the output in exactly this JSON structure:\n${expectedFormat}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });
      return { data: JSON.parse(completion.choices[0].message.content), attempts: attempt };
    } catch (error) {
      console.warn(`[Attempt ${attempt}/${maxRetries}] OpenAI Error: ${error.message}`);
      if (attempt === maxRetries) throw new Error(`OpenAI Failed after ${maxRetries} attempts: ${error.message}`);
      await delay(attempt * 2000); // Exponential backoff
    }
  }
}

async function processEntityBatch(table, entityName, getPrompt, expectedFormat, limit = 50) {
  console.log(`\n--- Fetching ${entityName} ---`);
  
  // Custom query conditions based on table
  const nameColumn = table === 'minifigures' ? 'name_en' : 'title_en';
  
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .or(`${nameColumn}.is.null,${nameColumn}.eq.""`)
    .limit(limit);
    
  if (error) {
    console.error(`Error fetching ${entityName}:`, error);
    return;
  }
  
  console.log(`Found ${data.length} ${entityName} to process.`);
  
  for (const item of data) {
    const identifier = item.title || item.name;
    const oldSlug = item.slug_en || null;
    console.log(`\nProcessing: ${identifier} (${item.id})`);
    
    try {
      const userPrompt = getPrompt(item);
      const aiResponse = await callOpenAIWithRetry(userPrompt, expectedFormat);
      const parsedData = aiResponse.data;
      const retriesUsed = aiResponse.attempts - 1;
      
      // Some fields like description_blocks_en might need to be parsed to object if AI returned string
      if (typeof parsedData.description_blocks_en === 'string') {
        try { parsedData.description_blocks_en = JSON.parse(parsedData.description_blocks_en); } catch(e) {}
      }

      // Generate slug and check duplicates
      const englishTitle = parsedData.editorial_slug_en || parsedData.title_en || parsedData.name_en;
      if (englishTitle) {
        let baseSlug = slugify(englishTitle);
        let duplicateCheck = await supabase
          .from(table)
          .select('id')
          .eq('slug_en', baseSlug)
          .not('id', 'eq', item.id)
          .maybeSingle();

        if (duplicateCheck.data) {
          baseSlug = `${baseSlug}-${item.id.split('-')[0]}`;
        }
        parsedData.slug_en = baseSlug;
      }
      
      parsedData.en_status = 'draft';
      delete parsedData.editorial_slug_en; // Prevent DB schema error
      
      const { error: updateError } = await supabase
        .from(table)
        .update(parsedData)
        .eq('id', item.id);
        
      if (updateError) {
        console.error(`Database Update failed for ${item.id}:`, updateError);
        failedItems.push({ table, id: item.id, old_slug: oldSlug, error: updateError.message });
      } else {
        console.log(`Success: ${identifier} -> ${parsedData.slug_en} (Retries: ${retriesUsed})`);
        successItems.push({ 
          table, 
          id: item.id, 
          old_slug: oldSlug, 
          new_slug: parsedData.slug_en, 
          retries: retriesUsed,
          status: 'success'
        });
      }
      
    } catch (e) {
      console.error(`Failed to process ${item.id}:`, e.message);
      failedItems.push({ table, id: item.id, old_slug: oldSlug, error: e.message });
    }
    
    await delay(1000); // Rate limit protection between items
  }
}

async function run() {
  console.log(`Starting bulk translation generation... ${isTestMode ? '[TEST MODE: Small Batch]' : '[FULL RUN]'}`);
  
  // 1. Minifigures
  await processEntityBatch(
    'minifigures', 
    'minifigures', 
    (item) => `Rewrite the following Turkish minifigure data into English:
Name: ${item.name}
Role: ${item.figure_role || item.role}
Type: ${item.figure_type || item.type}
Description: ${item.description}
Short Description: ${item.short_description_tr}`,
    `{
  "name_en": "English Name",
  "role_en": "English Role",
  "description_en": "Full English Description",
  "short_description_en": "Short English Description",
  "meta_title_en": "SEO Meta Title (Max 60 chars)",
  "meta_description_en": "SEO Meta Description (Max 160 chars)"
}`,
    isTestMode ? 5 : 100
  );

  // 2. Series
  await processEntityBatch(
    'series', 
    'series', 
    (item) => `Rewrite the following Turkish series data into English:
Title: ${item.title}
Category: ${item.category}
Summary: ${item.summary_tr}
Description: ${item.description}
Collector Comment: ${item.collector_comment_tr}`,
    `{
  "title_en": "English Title",
  "summary_en": "English Summary",
  "meta_title_en": "SEO Meta Title (Max 60 chars)",
  "meta_description_en": "SEO Meta Description (Max 160 chars)",
  "collector_comment_en": "English Collector Comment",
  "description_blocks_en": "English Description"
}`,
    isTestMode ? 3 : 50
  );

  // 3. News
  await processEntityBatch(
    'news', 
    'news', 
    (item) => `Rewrite the following Turkish news data into English:
Title: ${item.title}
Summary: ${item.summary}
Content: ${item.content}`,
    `{
  "title_en": "English Title",
  "editorial_slug_en": "Short SEO slug (max 3-4 words, NO stop words like 'a-guide-to', 'methods-for', 'how-to', 'between'). Keep it extremely concise and direct.",
  "summary_en": "English Summary",
  "meta_title_en": "SEO Meta Title (Max 60 chars)",
  "meta_description_en": "SEO Meta Description (Max 160 chars)",
  "content_blocks_en": "Full English Content HTML or blocks"
}`,
    isTestMode ? 2 : 50
  );

  console.log("\nFinished bulk processing.");
  
  if (successItems.length > 0) {
    console.log(`Writing ${successItems.length} successes to bulk-results.log...`);
    fs.writeFileSync('bulk-results.log', JSON.stringify(successItems, null, 2));
  }

  if (failedItems.length > 0) {
    console.log(`Encountered ${failedItems.length} errors. Writing to bulk-errors.log...`);
    fs.writeFileSync('bulk-errors.log', JSON.stringify(failedItems, null, 2));
  } else {
    console.log("No errors encountered!");
  }
}

run();
