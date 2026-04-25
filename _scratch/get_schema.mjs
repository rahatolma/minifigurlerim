import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: m } = await supabase.from('minifigures').select('*').limit(1);
  const { data: s } = await supabase.from('series').select('*').limit(1);
  const { data: n } = await supabase.from('news').select('*').limit(1);
  console.log('Minifigures keys:', Object.keys(m[0] || {}));
  console.log('Series keys:', Object.keys(s[0] || {}));
  console.log('News keys:', Object.keys(n[0] || {}));
}
run();
