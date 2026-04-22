import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: fig } = await supabase.from('minifigures').select('id, total_views').limit(1).single();
  console.log("Before view:", fig);
  await supabase.rpc('increment_page_view', { target_table: 'minifigures', target_id: fig.id });
  const { data: fig2 } = await supabase.from('minifigures').select('id, total_views').eq('id', fig.id).single();
  console.log("After view:", fig2);
}
test();
