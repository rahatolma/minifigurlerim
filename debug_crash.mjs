import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/["']/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  let query = supabase
    .from('minifigures')
    .select(`
       id, name, figure_name, slug_tr, slug, slug_en, figure_code, code, figure_number, figure_no,
       image_url, images, min_price, max_price, avg_price, value_usd, rarity_level, rarity, 
       value_score, demand_score, figure_role, role, figure_type, type, is_featured, created_at, series_id, 
       series:series_id(id, series_name, title, slug_tr, slug, slug_en, series_no, category_main, category, rarity)
    `)
    .limit(1);

  const { data, error } = await query;
  if(error) console.log("DB ERROR:", error);
  else console.log("DB OK!", data);
}
test();
