import fs from 'fs';

const columns = {
  'minifigures': 'id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published',
  'categories': 'id, created_at, name, slug, type',
  'about_settings': 'id, hero_image_url, quote_text, quote_author, boss_image_url, boss_title, boss_subtitle, boss_desc, main_title, main_text, mid_image_url, mid_title, mid_subtitle, mid_desc, small_image_url, small_title, small_subtitle, small_desc, join_image_url, join_title, join_text, join_btn_text, join_btn_link, created_at, content, content_en, updated_at',
  'contact_settings': 'id, address, phone, email, updated_at',
  'faqs': 'id, question, answer, sort_order, is_active, created_at, question_en, answer_en, order_num',
  'pages': 'id, slug, title, title_en, content_blocks, content_blocks_en, seo_metadata, created_at, updated_at',
  'news': 'id, title, slug, summary, content, cover_image_url, status, total_views, daily_views, min_read, created_at, cover_image_vertical_url, title_en, content_blocks_en',
  'profiles': 'id, username, avatar_url, created_at, is_approved, role, full_name, age, email, is_admin',
  'series': 'id, name, slug_tr, slug_en, description, description_en, is_active, release_year, category, category_main, cover_image_url, banner_image_url, blocks, series_no, rarity, figure_count, is_published, total_views, title, title_en',
  'user_collections': 'id, user_id, minifigure_id, status, created_at',
  'user_series_stats': 'id, user_id, series_id, completion_percent, owned_count, total_count'
};

const dalPaths = ['./src/services/dal.ts', './src/services/action_dal.ts'];

for (const p of dalPaths) {
  let content = fs.readFileSync(p, 'utf8');
  let changes = 0;
  
  content = content.replace(/\.from\('([^']+)'\)\s*\.select\('\*'\)/g, (match, table) => {
    if (columns[table]) {
      changes++;
      return `.from('${table}').select(String('${columns[table]}'))`;
    }
    return match;
  });

  content = content.replace(/\.from\('([^']+)'\)\s*\.select\('\*, series\([^)]+\)'\)/g, (match, table) => {
    if (columns[table]) {
      changes++;
      return `.from('${table}').select(String('${columns[table]}, series(id, name, slug_tr, slug_en, title, title_en)'))`;
    }
    return match;
  });

  content = content.replace(/\.select\('\*', \{ count: 'exact', head: true \}\)/g, (match) => {
    changes++;
    return `.select(String('id'), { count: 'exact', head: true })`;
  });

  if (changes > 0) {
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${p} with ${changes} changes.`);
  }
}
