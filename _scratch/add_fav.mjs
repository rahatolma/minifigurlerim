import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addFav() {
  const { data: figStats } = await supabase
      .from('minifigures')
      .select('collection_count_30d, favorite_count_30d')
      .eq('id', '9526d446-8fa4-4f95-b21c-0ae8ccee937a')
      .single();

  let favCount = figStats.favorite_count_30d || 0;
  favCount += 1; // Simulated newStatus === 'want'

  await supabase.from('minifigures').update({
      favorite_count_30d: favCount
  }).eq('id', '9526d446-8fa4-4f95-b21c-0ae8ccee937a');
  console.log("Favorite count incremented to", favCount);
}
addFav();
