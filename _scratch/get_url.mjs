import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getUrl() {
  const { data: fig } = await supabase.from('minifigures')
    .select('slug_tr, series(slug_tr)')
    .not('slug_tr', 'is', null)
    .limit(1)
    .single();
  console.log(`URL: http://localhost:3004/tr/figurler/${fig.series.slug_tr}/${fig.slug_tr}`);
}
getUrl();
