import fs from 'fs';
// Quick script to verify columns and indices
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/["']/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkIndex() {
  const { data, error } = await supabase.rpc('query_pg_indexes', {}); // Will likely fail without RPC but worth a try.
  if (error) console.log("Can't natively check pg_indexes over API.");
  else console.log(data);
}
checkIndex();
