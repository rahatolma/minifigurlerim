import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. Env Binding
const envPath = resolve(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error("❌ ERROR: .env.local not found. Run from project root or ensure .env.local exists.");
  process.exit(1);
}
const envFile = fs.readFileSync(envPath, 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/["']/g, '');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Supabase credentials missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Arg Parsing
const isCommit = process.argv.includes('--commit');

// 2. Strict CSV Parser
function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ERROR: Mandatory file ${filePath} not found!`);
    process.exit(1);
  }
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
  return [...rows]; // Remove empty references implicitly handled above
}

async function runHardenedImport() {
  console.log('🚀 ENTERPRISE IMPORT PIPELINE INITIATED');
  console.log(`MODE: ${isCommit ? '🔥 COMMIT (WRITE)' : '🛡️ DRY-RUN (READ-ONLY)'}\n`);

  const seriesRows = parseCSV(resolve(__dirname, '../public/import/Series.csv'));
  const figureRows = parseCSV(resolve(__dirname, '../public/import/Minifigures.csv'));

  console.log(`[DATA LOADED] -> Series: ${seriesRows.length} | Figures: ${figureRows.length}\n`);

  const stats = {
    series_inserted: 0,
    series_updated: 0,
    figures_inserted: 0,
    figures_updated: 0,
    errors: []
  };

  try {
    // --- PHASE 1: SERIES SYNC ---
    console.log('--- PHASE 1: SERIES VALIDATION & SYNC ---');
    const { data: dbSeriesAll, error: sErr } = await supabase.from('series').select('id, slug_tr');
    if (sErr) throw new Error(`Series Fetch Failed: ${sErr.message}`);

    const dbSeriesMap = new Map(); // slug_tr -> id
    dbSeriesAll.forEach(s => dbSeriesMap.set(s.slug_tr, s.id));

    const updatedSeriesCache = new Map();

    for (let i = 0; i < seriesRows.length; i++) {
      const row = seriesRows[i];
      const targetSlug = row.series_slug_tr;

      if (!targetSlug) {
         stats.errors.push(`Series Row ${i} missing series_slug_tr`);
         continue;
      }

      const payload = {
        title: row.series_name, // fallback inheritance
        slug: row.series_slug_tr, // fallback legacy
        series_name: row.series_name,
        slug_tr: row.series_slug_tr,
        slug_en: row.series_slug_en,
        product_code: row.product_code,
        category_main: row.category_main,
        category_sub: row.category_sub,
        release_date: row.release_date,
        release_month_tr: row.release_month_tr,
        release_month: row.release_month_tr, // legacy
        is_limited_production: row.is_limited_production,
        is_special_production: row.is_special_production,
        summary_tr: row.summary_tr,
        summary_en: row.summary_en,
        collector_comment_tr: row.collector_comment_tr,
        collector_comment_en: row.collector_comment_en,
        is_active: row.is_active,
        is_published: row.is_published,
        series_no: row.series_number,
        release_year: row.release_year ? parseInt(row.release_year) || null : null
      };

      if (dbSeriesMap.has(targetSlug)) {
        const sid = dbSeriesMap.get(targetSlug);
        updatedSeriesCache.set(targetSlug, sid);
        stats.series_updated++;
        if (isCommit) {
           const { error } = await supabase.from('series').update(payload).eq('id', sid);
           if (error) stats.errors.push(`[SERIES UPDATE FAIL] ${targetSlug}: ${error.message}`);
        }
      } else {
        stats.series_inserted++;
        if (isCommit) {
           const { data, error } = await supabase.from('series').insert([payload]).select('id').single();
           if (error) {
              stats.errors.push(`[SERIES INSERT FAIL] ${targetSlug}: ${error.message}`);
           } else {
              updatedSeriesCache.set(targetSlug, data.id);
           }
        } else {
           updatedSeriesCache.set(targetSlug, `SIMULATED_ID_${i}`);
        }
      }
    }

    // --- PHASE 2: FIGURES SYNC ---
    console.log('\n--- PHASE 2: MINIFIGURES VALIDATION & SYNC ---');

    const { data: dbFigsAll, error: fErr } = await supabase.from('minifigures').select('id, figure_code');
    if (fErr) throw new Error(`Figures Fetch Failed: ${fErr.message}`);

    const dbFiguresMap = new Map(); // figure_code -> id
    dbFigsAll.forEach(f => dbFiguresMap.set(f.figure_code, f.id));

    for (let i = 0; i < figureRows.length; i++) {
       const fig = figureRows[i];
       const pSlug = fig.series_slug_tr;

       if (!pSlug) {
           stats.errors.push(`Figure Row ${i} [${fig.figure_name || 'NO_NAME'}] missing parent series_slug_tr. Skipping.`);
           continue; 
       }
       if (!updatedSeriesCache.has(pSlug) && !dbSeriesMap.has(pSlug)) {
           // STRICT VALIDATION
           stats.errors.push(`Figure [${fig.figure_code}] -> Parent Series slug '${pSlug}' DOES NOT EXIST in Database. FATAL IGNORE.`);
           continue;
       }

       const seriesId = updatedSeriesCache.get(pSlug) || dbSeriesMap.get(pSlug);
       const fCode = fig.figure_code;

       if (!fCode) {
         stats.errors.push(`Figure Row ${i} [${fig.figure_name}] missing figure_code. Match mechanism broken. Skipping.`);
         continue;
       }

       if (!fig.figure_name) {
         stats.errors.push(`Figure Row [${fCode}] missing required 'figure_name'. Skipping to prevent DB crash constraint.`);
         continue;
       }
       if (!fig.figure_number) {
         stats.errors.push(`Figure Row [${fCode}] missing required 'figure_number'. Strict Contract Violation. Skipping.`);
         continue;
       }
       if (!fig.piece_count && fig.piece_count !== "0") {
         stats.errors.push(`Figure Row [${fCode}] missing required 'piece_count'. Strict Contract Violation. Skipping.`);
         continue;
       }
       
       const fPayload = {
         series_id: seriesId,
         
         // Legacy Not-Null Fallbacks (To keep legacy schemas from crashing)
         name: fig.figure_name,
         slug: fig.figure_slug_tr,
         code: fig.figure_code,
         figure_no: fig.figure_number,

         // Canonical Direct Routes
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
         piece_count: fig.piece_count ? parseInt(fig.piece_count) || null : null,            // FIX FOR CRISIS!
         accessory_count: fig.accessory_count ? parseInt(fig.accessory_count) || null : null,
         main_color: fig.main_color,
         thumbnail_url: fig.thumbnail_url,
         is_featured: fig.is_featured,
         is_active: fig.is_active,
         is_published: fig.is_published
       };

       if (dbFiguresMap.has(fCode)) {
          stats.figures_updated++;
          if (isCommit) {
             const { error } = await supabase.from('minifigures').update(fPayload).eq('id', dbFiguresMap.get(fCode));
             if (error) stats.errors.push(`[FIG UPDATE] ${fCode}: ${error.message}`);
          }
       } else {
          stats.figures_inserted++;
          if (isCommit) {
             const { error } = await supabase.from('minifigures').insert([fPayload]);
             if (error) stats.errors.push(`[FIG INSERT] ${fCode}: ${error.message}`);
          }
       }
    }

    console.log('\n======================================');
    console.log('[ DRY-RUN / EXECUTION REPORT ]');
    console.log('======================================');
    console.log(`♻️  SERIES UPDATES:    ${stats.series_updated}`);
    console.log(`➕  SERIES INSERTS:    ${stats.series_inserted}`);
    console.log(`♻️  FIGURE UPDATES:    ${stats.figures_updated}`);
    console.log(`➕  FIGURE INSERTS:    ${stats.figures_inserted}`);
    console.log(`❌  CRITICAL ERRORS:   ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
       console.log('\n--- ERROR LOGS ---');
       stats.errors.forEach(e => console.log(' -> ' + e));
    }

    if (!isCommit && stats.errors.length === 0) {
       console.log('\n> ✅ Dry Run Successful. No validation errors found.');
       console.log('> 🚀 Ready to inject. Run: node scripts/hardened_import.mjs --commit');
    }

  } catch (err) {
    console.error('\n❌ FATAL PIPELINE EXCEPTION:', err.message);
  }
}

runHardenedImport();
