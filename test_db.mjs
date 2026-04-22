import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await sb.from('minifigures').select('id, name, slug_tr, slug_en, slug, is_published, series_name').or('slug_tr.ilike.%penguin%,slug_en.ilike.%penguin%,slug_tr.ilike.%fencer%,slug_en.ilike.%fencer%,name.ilike.%fencer%,name.ilike.%penguin%');
  console.log(JSON.stringify(data, null, 2));
}
run();
