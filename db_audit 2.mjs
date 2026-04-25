import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  let allFigures = [];
  let from = 0;
  const step = 999;
  
  while(true) {
    const { data, error } = await supabase.from('minifigures').select('*').range(from, from + step);
    if(error) { console.error(error); return; }
    if(!data || data.length === 0) break;
    allFigures = allFigures.concat(data);
    from += step + 1;
    if(data.length <= step) break;
  }

  const total = allFigures.length;
  console.log(`\n\n--- 826 FIGURE BULK AUDIT (${total} records retrieved) ---`);
  
  const stats = {
    short_description_tr: 0,
    description: 0,
    figure_role: 0,
    figure_type: 0,
    release_month: 0,
    release_year: 0,
    figure_number: 0,
    piece_count: 0
  };

  allFigures.forEach(f => {
    if (f.short_description_tr && f.short_description_tr.trim().length > 0) stats.short_description_tr++;
    if (f.description && f.description.trim().length > 0) stats.description++;
    if (f.figure_role && f.figure_role.trim().length > 0) stats.figure_role++;
    if (f.figure_type && f.figure_type.trim().length > 0) stats.figure_type++;
    if (f.release_month && f.release_month.trim().length > 0) stats.release_month++;
    if (f.release_year) stats.release_year++; 
    if (f.figure_number || f.figure_number === 0 || f.figure_number === '0') stats.figure_number++;
    if (f.piece_count || f.piece_count === 0) stats.piece_count++;
  });

  console.log(">> DB DOLULUK ORANLARI:");
  for (const [key, val] of Object.entries(stats)) {
    const percent = ((val / total) * 100).toFixed(1);
    console.log(`${key.padEnd(22)} : ${String(val).padStart(4)} dolu / ${String(total - val).padStart(4)} boş  (%${percent})`);
  }
}

run();
