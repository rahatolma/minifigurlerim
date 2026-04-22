import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: fig } = await supabase.from('minifigures').select('id, collection_count_30d').limit(1).single();
  const userId = '00000000-0000-0000-0000-000000000000'; // Fake user ID
  
  console.log("Before collection:", fig);
  
  await supabase.from('user_collections').upsert({
    user_id: userId,
    minifigure_id: fig.id,
    status: 'have'
  }, { onConflict: 'user_id, minifigure_id' });
  
  const { data: fig2 } = await supabase.from('minifigures').select('id, collection_count_30d').eq('id', fig.id).single();
  console.log("After collection:", fig2);

  await supabase.from('user_collections').delete().eq('user_id', userId).eq('minifigure_id', fig.id);
}
test();
