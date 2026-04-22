import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: sData, error: sErr } = await supabase.from('minifigures').select('*').limit(1);
  if (sErr) console.error("minifigures Error:", sErr);
  else console.log("minifigures Columns:", Object.keys(sData[0]));
}
test();
