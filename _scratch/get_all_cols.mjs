import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const tables = ['series', 'minifigures', 'contact_messages', 'categories', 'about_settings', 'contact_settings', 'user_series_stats', 'faqs', 'home_banners', 'pages', 'user_collections', 'global_stats', 'news', 'profiles'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (data && data.length > 0) {
      console.log(`${table}: ${Object.keys(data[0]).join(', ')}`);
    } else {
      console.log(`${table}: NOT FOUND OR EMPTY`);
    }
  }
}
run();
