import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We just want to test if we can fetch the slug easily
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data } = await supabase.from('minifigures').select('slug_tr, slug_en, series(slug_tr, slug_en)').eq('id', '9526d446-8fa4-4f95-b21c-0ae8ccee937a').single();
  console.log(data);
}
test();
