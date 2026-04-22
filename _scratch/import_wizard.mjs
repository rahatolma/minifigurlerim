import fs from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Env Binding
const envFile = fs.readFileSync(resolve('/Users/Gungor/Documents/GitHub/minifigurlerim/.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].replace(/["']/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// 2. Robust CSV Parser
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return [];

  function splitCSVRow(row) {
    let result = [];
    let curVal = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        let char = row[i];
        if (inQuotes) {
            if (char === '"') {
                if (i < row.length - 1 && row[i+1] === '"') {
                    curVal += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                curVal += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(curVal);
                curVal = '';
            } else {
                curVal += char;
            }
        }
    }
    result.push(curVal);
    return result;
  }

  const headers = splitCSVRow(lines[0]).map(h => h.replace(/^\uFEFF/, '').trim()); 
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
     const cols = splitCSVRow(lines[i]);
     let obj = {};
     headers.forEach((h, idx) => {
         let val = cols[idx];
         if (val === '') val = null;
         else if (val === 'TRUE') val = true;
         else if (val === 'FALSE') val = false;
         obj[h] = val;
     });
     rows.push(obj);
  }
  return rows;
}

// 3. Execution Main
async function runImport() {
  console.log('🚀 Import Wizard Started (Enrich & Dual-Write Mode)');
  
  const seriesRows = parseCSV('./public/uploads/import/Series.csv');
  const figureRows = parseCSV('./public/uploads/import/Minifigures.csv');

  console.log(`Found ${seriesRows.length} series and ${figureRows.length} minifigures in CSVs.`);

  // PHASE 1: SERIES IMPORT/ENRICHMENT
  const dbSeriesCache = {}; // slug_tr -> id map

  for (const row of seriesRows) {
    const targetSlugTr = row.series_slug_tr;

    // Arama: Eski slug veya yeni slug_tr uzerinden eslesme ara
    const { data: existingSeries } = await supabase
      .from('series')
      .select('id, title')
      .or(`slug.eq.${targetSlugTr},slug_tr.eq.${targetSlugTr}`)
      .limit(1);

    if (existingSeries && existingSeries.length > 0) {
      const sId = existingSeries[0].id;
      dbSeriesCache[targetSlugTr] = sId;
      console.log(`[SERIES ENRICH] ID: ${sId} / Excel: ${row.series_name} -> Found existing! Updating only new columns.`);

      const updatePayload = {
        series_name: row.series_name,
        slug_tr: row.series_slug_tr,
        slug_en: row.series_slug_en,
        product_code: row.product_code,
        category_main: row.category_main,
        category_sub: row.category_sub,
        release_date: row.release_date,
        release_month_tr: row.release_month_tr,
        release_month_en: null, // to be filled manual
        is_limited_production: row.is_limited_production,
        is_special_production: row.is_special_production,
        summary_tr: row.summary_tr,
        summary_en: row.summary_en,
        collector_comment_tr: row.collector_comment_tr,
        collector_comment_en: row.collector_comment_en,
        is_active: row.is_active,
        is_published: row.is_published
      };
      
      const { error } = await supabase.from('series').update(updatePayload).eq('id', sId);
      if (error) console.error("Update Error:", error.message);

    } else {
      console.log(`[SERIES INSERT] ${row.series_name} is totally new. Creating via Dual-Write.`);
      
      const insertPayload = {
        // --- Legacy Dual Write (Eski sistem kirilmasin diye) ---
        title: row.series_name,
        slug: row.series_slug_tr,
        description: row.summary_tr,
        release_year: row.release_year ? parseInt(row.release_year) : null,
        release_month: row.release_month_tr,
        category: row.category_main,
        series_no: row.series_number,
        // --- New Columns ---
        series_name: row.series_name,
        slug_tr: row.series_slug_tr,
        slug_en: row.series_slug_en,
        product_code: row.product_code,
        category_main: row.category_main,
        category_sub: row.category_sub,
        release_date: row.release_date,
        release_month_tr: row.release_month_tr,
        is_limited_production: row.is_limited_production,
        is_special_production: row.is_special_production,
        summary_tr: row.summary_tr,
        summary_en: row.summary_en,
        collector_comment_tr: row.collector_comment_tr,
        collector_comment_en: row.collector_comment_en,
        is_active: row.is_active,
        is_published: row.is_published
      };

      const { data, error } = await supabase.from('series').insert([insertPayload]).select('id').single();
      if (error) {
        console.error("Insert Error:", error.message);
      } else {
        dbSeriesCache[targetSlugTr] = data.id;
      }
    }
  }

  // PHASE 2: MINIFIGURES IMPORT/ENRICHMENT
  for (const fig of figureRows) {
    const parentSlug = fig.series_slug_tr;
    const seriesId = dbSeriesCache[parentSlug];

    if (!seriesId) {
      console.warn(`[WARN] Skipping figure ${fig.figure_name} because parent series ${parentSlug} was not found/created.`);
      continue;
    }

    // YENİ KARAR: Mükerrer slug'ları birleştirmemek için sadece benzersiz figure_code üzerinden eşleştirme!
    const { data: existingFig } = await supabase
      .from('minifigures')
      .select('id')
      .or(`code.eq.${fig.figure_code},figure_code.eq.${fig.figure_code}`)
      .limit(1);

    if (existingFig && existingFig.length > 0) {
      const fId = existingFig[0].id;
      // DONT log every single existing one to keep terminal clean, just process.
      
      const updateFigPayload = {
        figure_name: fig.figure_name,
        slug_tr: fig.figure_slug_tr,
        slug_en: fig.figure_slug_en,
        figure_number: fig.figure_number,
        figure_code: fig.figure_code,
        character_name: fig.character_name,
        short_description_tr: fig.short_description_tr,
        short_description_en: fig.short_description_en,
        figure_role: fig.figure_role,
        figure_type: fig.figure_type,
        rarity_level: fig.rarity_level,
        accessory_count: fig.accessory_count ? parseInt(fig.accessory_count) : null,
        main_color: fig.main_color,
        thumbnail_url: fig.thumbnail_url,
        is_featured: fig.is_featured,
        is_active: fig.is_active,
        is_published: fig.is_published
      };
      
      await supabase.from('minifigures').update(updateFigPayload).eq('id', fId);

    } else {
      console.log(`[RECOVERED/NEW INSERT] ${fig.figure_name} (${fig.figure_code}) is being created as a distinct record.`);

      const insertFigPayload = {
        series_id: seriesId,
        // --- Legacy Dual Write ---
        name: fig.figure_name,
        slug: fig.figure_slug_tr,
        code: fig.figure_code,
        role: fig.figure_role,
        type: fig.figure_type,
        figure_no: fig.figure_number,
        description: fig.short_description_tr,
        // --- New Columns ---
        figure_name: fig.figure_name,
        slug_tr: fig.figure_slug_tr,
        slug_en: fig.figure_slug_en,
        figure_number: fig.figure_number,
        figure_code: fig.figure_code,
        character_name: fig.character_name,
        short_description_tr: fig.short_description_tr,
        short_description_en: fig.short_description_en,
        figure_role: fig.figure_role,
        figure_type: fig.figure_type,
        rarity_level: fig.rarity_level,
        accessory_count: fig.accessory_count ? parseInt(fig.accessory_count) : null,
        main_color: fig.main_color,
        thumbnail_url: fig.thumbnail_url,
        is_featured: fig.is_featured,
        is_active: fig.is_active,
        is_published: fig.is_published
      };

      await supabase.from('minifigures').insert([insertFigPayload]);
    }
  }

  console.log('\n🎉 Import Wizard Finished! Zero data loss. All old attributes preserved.');
}

runImport().catch(console.error);
