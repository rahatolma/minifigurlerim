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
       { name: "Alien", slug: "alien", code: "col21-3", figure_code: "col21-3", series_id: "19ba7623-348d-40fa-aaa5-7100e1af327c" }
   ]);
   console.log("Insert result error:", error);
}
run();
