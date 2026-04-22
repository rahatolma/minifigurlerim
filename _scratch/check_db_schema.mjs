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
  const { data: tables, error } = await supabase.rpc('get_tables_info'); // if exists, else we can just do a rest query to a known table
  // We can query information_schema if we had postgres connection, but from REST we can't.
  
  // Let's just try to query known possible tables for user collections/views
  const possibleTables = ['user_collections', 'wishlists', 'page_views', 'interactions', 'minifigure_interactions'];
  for (const t of possibleTables) {
    const { error: e } = await supabase.from(t).select('*').limit(1);
    if (!e) console.log(`Table exists: ${t}`);
  }
}
main();
