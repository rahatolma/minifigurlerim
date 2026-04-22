import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reset() {
  const { data: fig } = await supabase.from('minifigures').select('id').eq('slug_tr', 'cave-woman').limit(1).single();
  if (fig) {
     await supabase.from('minifigures').update({ total_views: 0, collection_count_30d: 0, favorite_count_30d: 0 }).eq('id', fig.id);
     console.log("Reset figure ID:", fig.id);
  }
}
reset();
