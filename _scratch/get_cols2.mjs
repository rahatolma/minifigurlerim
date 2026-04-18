import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  for (const table of ['home_sliders', 'definition_groups', 'minifigure_price_history']) {
    const { data } = await supabase.from(table).select('*').limit(1);
    if(data && data.length) console.log(`${table}: ${Object.keys(data[0]).join(', ')}`);
  }
}
run();
