require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testFetch() {
  const { data, error } = await supabase.from('about_settings').select('id, hero_image_url, quote_text, quote_author, boss_image_url, boss_title, boss_subtitle, boss_desc, main_title, main_text, mid_image_url, mid_title, mid_subtitle, mid_desc, small_image_url, small_title, small_subtitle, small_desc, join_image_url, join_title, join_text, join_btn_text, join_btn_link, created_at, content, content_en, updated_at').eq('id', 1).single();
  console.log("FETCH RESULT:", data.main_text ? data.main_text.substring(0,20) + '...' : 'NULL');
}
testFetch();
