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
       { name: "Space Fan", slug: "space-fan", code: "col26-12", figure_code: "col26-12", series_id: "894b611b-fee9-4e8c-8cf2-671d75b05746" }
   ]);
   console.log("Insert result error:", error);
}
run();
