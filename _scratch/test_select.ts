import { createClient } from '@supabase/supabase-js';

async function test() {
   const supabase = createClient('http://localhost', 'dummy');
   const { data } = await supabase.from('series').select('id, name, slug_tr, slug_en, description, description_en, is_active, release_year, category, category_main, cover_image_url, banner_image_url, blocks, series_no, rarity, figure_count, is_published, total_views, title, title_en');
   console.log(data?.[0]?.title_en);
}
