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
  const { error } = await supabase.from('minifigures').insert([
     { name: "Test Alien", slug: "alien", code: "test-code-123", series_id: "5efe69c9-32f8-499e-91f1-a7da304bb260" }
  ]);
  console.log(error);
}
test();
