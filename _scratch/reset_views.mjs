import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reset() {
  const t1 = await supabase.from('minifigures').update({ total_views: 0, daily_views: 0, view_count_30d: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Minifigures reset:", t1.error ? t1.error : "success");
  
  const t2 = await supabase.from('series').update({ total_views: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Series reset:", t2.error ? t2.error : "success");

  // Try posts/news if exists
  const t3 = await supabase.from('posts').update({ view_count: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Posts reset:", t3.error ? t3.error : "success");
}
reset();
