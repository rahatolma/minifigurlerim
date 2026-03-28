import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const KEY = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(URL, KEY);
async function run() {
  const { data } = await supabase.from('minifigures').select('id, name, slug');
  console.log(JSON.stringify(data, null, 2));
}
run();
