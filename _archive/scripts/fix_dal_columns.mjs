import fs from 'fs';

const path = 'src/services/dal.ts';
let content = fs.readFileSync(path, 'utf8');

// The NEW 100% VALID strings based on actual DB schema
const validSeries = "id, created_at, title, description, category, series_no, brand, cover_image_url, figure_count, total_views, daily_views, release_month, release_year, description_2, hero_image_url, box_image_url, collector_image_url, collector_note, slug, general_image_url, rarity, content_blocks, title_en, description_blocks_en, slug_en, meta_title_en, meta_description_en, series_name, slug_tr, product_code, category_main, category_sub, release_date, release_month_tr, release_month_en, is_limited_production, is_special_production, summary_tr, summary_en, collector_comment_tr, collector_comment_en, is_active, is_published";

const validMinifigures = "id, created_at, series_id, name, brand, category, series_name, series_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published, figure_role_id, figure_type_id, rarity_id";

// The CURRENT strings in dal.ts
const currentSeries = "id, created_at, title, description, category, series_no, brand, cover_image_url, figure_count, total_views, daily_views, release_month, release_year, description_2, hero_image_url, box_image_url, collector_image_url, collector_note, slug, general_image_url, rarity, content_blocks, title_en, description_blocks_en, slug_en, meta_title_en, meta_description_en, series_name, slug_tr, product_code, category_main, category_sub, release_date, release_month_tr, release_month_en, is_limited_production, is_special_production, summary_tr, summary_en, collector_comment_tr, collector_comment_en, is_active, is_published, meta_title, meta_description";
const currentMinifigures = "id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published";
const currentMinifigures2 = "id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published, meta_title, meta_description, meta_title_en, meta_description_en";

// Safely replace exact strings (we leave `series(...)` relation string intact since it's hardcoded and mostly correct, wait, let's check it)
content = content.split(`'${currentSeries}'`).join(`'${validSeries}'`);
content = content.split(`'${currentMinifigures}'`).join(`'${validMinifigures}'`);
content = content.split(`'${currentMinifigures2}'`).join(`'${validMinifigures}'`);

// Fix the relation string specifically: series(id, title, slug, slug_tr, slug_en, title_en, category, series_no, release_year, created_at) is perfectly valid because those 10 columns exist!
content = content.split(`'${currentMinifigures}, series(id, title, slug, slug_tr, slug_en, title_en, category, series_no, release_year, created_at)'`).join(`'${validMinifigures}, series(id, title, slug, slug_tr, slug_en, title_en, category, series_no, release_year, created_at)'`);
content = content.split(`'${currentMinifigures2}, series(id, title, slug, slug_tr, slug_en, title_en, category, series_no, release_year, created_at)'`).join(`'${validMinifigures}, series(id, title, slug, slug_tr, slug_en, title_en, category, series_no, release_year, created_at)'`);

fs.writeFileSync(path, content);
console.log("Fixed columns in dal.ts");
