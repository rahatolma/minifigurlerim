import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const KEY = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(URL, KEY);
async function run() {
  const slug = "super-wrestler-lego-minifigurler-serisi-1";
  const { data: figure, error } = await supabase.from('minifigures').select('*, series(slug)').eq('slug', slug).single();
  console.log("Error:", error?.message);
  console.log("Figure Name:", figure?.name, "Series Slug:", figure?.series?.slug);
}
run();
