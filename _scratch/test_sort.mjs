import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('minifigures')
    .select('id, name, series_name, release_year, release_month, series_no, figure_number, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  console.log("Ordered by created_at DESC:");
  console.table(data);
}
check();
