import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reset() {
  const { data, error } = await supabase.from('news').update({ total_views: 0, daily_views: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("News reset:", error ? error : "success");
}
reset();
