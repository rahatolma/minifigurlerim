import fs from 'fs';

const path = 'src/services/dal.ts';
let content = fs.readFileSync(path, 'utf8');

const oldNews = "id, title, slug, summary, content, cover_image_url, status, total_views, daily_views, min_read, created_at, cover_image_vertical_url, title_en, content_blocks_en";
const newNews = "id, title, slug, slug_en, summary, content, cover_image_url, status, total_views, daily_views, min_read, created_at, cover_image_vertical_url, title_en, content_blocks_en, meta_title_en, meta_description_en, meta_title, meta_description";

const oldSeries = "id, name, slug_tr, slug_en, description, description_en, is_active, release_year, category, category_main, cover_image_url, banner_image_url, blocks, series_no, rarity, figure_count, is_published, total_views, title, title_en";
const newSeries = "id, created_at, title, description, category, series_no, brand, cover_image_url, figure_count, total_views, daily_views, release_month, release_year, description_2, hero_image_url, box_image_url, collector_image_url, collector_note, slug, general_image_url, rarity, content_blocks, title_en, description_blocks_en, slug_en, meta_title_en, meta_description_en, series_name, slug_tr, product_code, category_main, category_sub, release_date, release_month_tr, release_month_en, is_limited_production, is_special_production, summary_tr, summary_en, collector_comment_tr, collector_comment_en, is_active, is_published, meta_title, meta_description";

// Notice the missing comma or extra spaces? We'll just replace the exact substrings.
content = content.split(oldNews).join(newNews);
content = content.split(oldSeries).join(newSeries);

// Now fix the series() inside minifigures query
const oldMinifigSeries = "series(id, name, slug_tr, slug_en, title, title_en)";
const newMinifigSeries = "series(id, title, slug, slug_tr, slug_en, title_en, category, series_no, release_year, created_at)";
content = content.split(oldMinifigSeries).join(newMinifigSeries);

fs.writeFileSync(path, content);
console.log("Replaced DAL.ts select strings");
