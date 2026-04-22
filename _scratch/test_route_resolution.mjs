import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testSlug(slug, locale) {
  let query = supabase.from('minifigures').select('id, name, slug_tr, slug_en, slug');
  if (locale === 'en') {
      query = query.or(`slug_en.eq.${slug},slug.eq.${slug}`);
  } else if (locale === 'tr') {
      query = query.or(`slug_tr.eq.${slug},slug.eq.${slug}`);
  } else {
      query = query.or(`slug.eq.${slug},slug_tr.eq.${slug},slug_en.eq.${slug}`);
  }
  const { data, error } = await query.order('is_published', { ascending: false }).order('created_at', { ascending: false }).limit(1);
  return { slug, locale, found: data && data.length > 0 ? data[0].name : "NOT_FOUND" };
}

async function run() {
  console.log(await testSlug('fencer', 'tr'));
  console.log(await testSlug('fencer', 'en'));
  console.log(await testSlug('baby-penguin', 'tr'));
  console.log(await testSlug('baby-penguin', 'en'));
  console.log(await testSlug('fencer-zombie', 'tr'));
  console.log(await testSlug('baby-penguin-zom2', 'en'));
}
run();
