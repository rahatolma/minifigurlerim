const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const slug = 'lego-minifigurler-serisi-6';
  const { data: series, error } = await supabase.from('series').select('*').or(`slug.eq.${slug},id.eq.${slug},slug_en.eq.${slug}`).single();
  console.log('Error:', error);
  console.log('Series title:', series?.title);
  console.log('Series slug:', series?.slug);
  console.log('Series slug_en:', series?.slug_en);
}

check();
