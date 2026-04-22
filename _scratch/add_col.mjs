import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addCol() {
  const { data: figStats } = await supabase
      .from('minifigures')
      .select('collection_count_30d, favorite_count_30d')
      .eq('id', '9526d446-8fa4-4f95-b21c-0ae8ccee937a')
      .single();

  let colCount = figStats.collection_count_30d || 0;
  colCount += 1; // Simulated newStatus === 'have'

  await supabase.from('minifigures').update({
      collection_count_30d: colCount
  }).eq('id', '9526d446-8fa4-4f95-b21c-0ae8ccee937a');
  console.log("Collection count incremented to", colCount);
}
addCol();
