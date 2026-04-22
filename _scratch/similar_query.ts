import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data } = await supabase.from('minifigures').select('id, name, slug_tr, slug_en, series_name, series(slug_tr, slug_en), rarity_level, thumbnail_url, images').eq('series_id', 'a98f58be-5444-42f5-bbbe-5c68ff83c8dc').not('id', 'eq', '9526d446-8fa4-4f95-b21c-0ae8ccee937a').limit(4);
  console.log(data);
}
test();
