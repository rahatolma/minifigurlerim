import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envFile = readFileSync(resolve('/Users/Gungor/Documents/GitHub/minifigurlerim/.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].replace(/["']/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: s } = await supabase.from('series').select('*').limit(1);
  const { data: m } = await supabase.from('minifigures').select('*').limit(1);
  console.log("Series keys:", s ? Object.keys(s[0]) : "No series");
  console.log("Minifigures keys:", m ? Object.keys(m[0]) : "No minifigs");
}

main().catch(console.error);
