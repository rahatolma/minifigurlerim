import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('minifigures')
    .select('id, name, series(title, release_year, series_no)')
    .order('series(release_year)', { ascending: false, nullsFirst: false })
    .order('series(series_no)', { ascending: false, nullsFirst: false })
    .limit(10);
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}
check();
