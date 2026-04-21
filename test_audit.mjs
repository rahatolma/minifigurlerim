import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: figures, error } = await supabase
    .from('minifigures')
    .select('*, series:series_id(id, title, category, release_month, release_year, category_main)')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) { console.error(error); return; }

  const picked = [];
  
  // Try to pick diverse ones
  const targetCategories = ['Minifigure Series', 'Özel Seriler', 'Licensed', 'Super Mario'];
  for (const f of figures) {
    if (picked.length >= 10) break;
    // ensure representation
    picked.push(f);
  }

  // Print results
  for (let i = 0; i < 10; i++) {
    const f = picked[i];
    if (!f) continue;

    console.log(`\n\n--- FIGURE ${i+1}: ${f.figure_name || f.name} ---`);
    console.log(`Category: ${f.series?.category_main || f.series?.category || 'Unknown'}`);
    
    console.log(">> DB RAW ROW:");
    console.log(`figure_role: ${f.figure_role} | role: ${f.role}`);
    console.log(`figure_type: ${f.figure_type} | type: ${f.type}`);
    console.log(`release_month (local): ${f.release_month} | series.release_month: ${f.series?.release_month}`);
    console.log(`release_year (local): ${f.release_year} | series.release_year: ${f.series?.release_year}`);
    console.log(`short_desc: ${f.short_description_tr?.substring(0,10)} | desc: ${f.description?.substring(0,10)}`);

    console.log(">> ADMIN PRELOAD (AFTER OUR FIX):");
    console.log(`Figür Rolü: ${f.figure_role || f.role || 'Seçim Yapılmadı'}`);
    console.log(`Figür Tipi: ${f.figure_type || f.type || 'Seçim Yapılmadı'}`);
    console.log(`Release Month: ${f.release_month || f.series?.release_month || 'Boş'}`);
    console.log(`Release Year: ${f.release_year || f.series?.release_year || 'Boş'}`);
    console.log(`Desc: ${f.short_description_tr || f.description || 'Boş'}`);

    console.log(">> PUBLIC MAPPER:");
    console.log(`figure_role: ${f.figure_role || 'null (!) no fallback'}`);
    console.log(`figure_type: ${f.figure_type || 'null (!) no fallback'}`);
    console.log(`release_month: ${f.series?.release_month || 'null (!) strict series only'}`);
    console.log(`release_year: ${f.series?.release_year || 'null (!) strict series only'}`);
    console.log(`short_desc: ${f.short_description_tr || f.description || 'null'}`);
  }
}

run();
