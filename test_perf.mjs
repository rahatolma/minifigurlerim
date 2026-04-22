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
   // Fetching full payload
   const start = Date.now();
   const { data, error } = await supabase.from('minifigures').select('*, series(*)').order('created_at', { ascending: false });
   const time = Date.now() - start;
   
   if(error) { console.error(error); return; }
   const stringified = JSON.stringify(data);
   const mbSize = (Buffer.byteLength(stringified, 'utf8') / 1024 / 1024).toFixed(2);
   console.log(`[FULL SELECT] Fetched ${data.length} records in ${time}ms.`);
   console.log(`[FULL SELECT] Payload size: ${mbSize} MB`);

   // Fetching projection
   const start2 = Date.now();
   const { data: d2 } = await supabase.from('minifigures')
        .select(`id, name, figure_name, slug, slug_tr, slug_en, figure_code, code, figure_number, image_url, images, min_price, max_price, avg_price, rarity_level, rarity, value_score, demand_score, figure_role, figure_type, is_featured, series_id, created_at, 
                 series!inner(id, series_name, title, slug_tr, slug, slug_en, series_number, number, category_main, category, manual_rarity, rarity, final_rarity)`)
        .order('created_at', { ascending: false });
   const time2 = Date.now() - start2;
   const mbSize2 = (Buffer.byteLength(JSON.stringify(d2), 'utf8') / 1024 / 1024).toFixed(2);
   console.log(`[PROJECTION SELECT] Fetched ${d2.length} records in ${time2}ms.`);
   console.log(`[PROJECTION SELECT] Payload size: ${mbSize2} MB`);
}
checkBloat();
