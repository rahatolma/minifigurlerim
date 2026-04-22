import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/["']/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
   const { error } = await supabase.from('minifigures').insert([
       { name: "Alien", slug: "alien", code: "col06-15", figure_code: "col06-15", series_id: "e46e215a-0e31-41a3-90eb-1836705354ab" }
   ]);
   console.log("Insert result error:", error);
}
run();
