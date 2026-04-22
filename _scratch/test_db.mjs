import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/["']/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { count: sCount } = await supabase.from('series').select('*', { count: 'exact', head: true });
  const { count: fCount } = await supabase.from('minifigures').select('*', { count: 'exact', head: true });
  console.log(`DB Count -> Series: ${sCount}, Minifigures: ${fCount}`);
}
check();
