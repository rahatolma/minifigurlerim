const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envs = fs.readFileSync('.env.local', 'utf8').split('\n');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';

for (const line of envs) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].replace(/"/g, '');
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_KEY = line.split('=')[1].replace(/"/g, '');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: cols, error: err } = await supabase.rpc('get_schema_info'); // Wait, we don't have this.
  
  // Let's just query a single figure to see the exact column names
  const { data: fig, error } = await supabase.from('minifigures').select('*').limit(1);
  console.log("Minifigures columns:", fig ? Object.keys(fig[0]) : error);
  
  const { data: cat, error: catErr } = await supabase.from('categories').select('*').limit(1);
  console.log("Categories columns:", cat ? Object.keys(cat[0]) : catErr);
}
run();
