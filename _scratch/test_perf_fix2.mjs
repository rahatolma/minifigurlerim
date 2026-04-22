import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/["']/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkBloat() {
   // Projection
   const start2 = Date.now();
   
   const SELECT_FIELDS = `
     id, figure_name, name, slug_tr, slug, slug_en, figure_code, code, figure_number, 
     image_url, images, min_price, max_price, avg_price, value_usd, rarity_level, rarity, 
     value_score, demand_score, figure_role, role, figure_type, type, is_featured, created_at, series_id, 
     series:series_id(id, series_name, title, slug_tr, slug, slug_en, number, category_main, category, manual_rarity, rarity, final_rarity)
   `;

   const { data: d2, error: err2 } = await supabase.from('minifigures')
        .select(SELECT_FIELDS)
        .order('created_at', { ascending: false });
   const time2 = Date.now() - start2;
   
   if(err2) { console.error("PROJECTION FAILED:", err2); return; }

   const mbSize2 = (Buffer.byteLength(JSON.stringify(d2), 'utf8') / 1024 / 1024).toFixed(2);
   console.log(`\n[NEW PROJECTION] Fetched ${d2.length} records in ${time2}ms.`);
   console.log(`[NEW PROJECTION] Payload size reduced to: ${mbSize2} MB`);
}
checkBloat();
