-- ========================================================
-- ADDITIVE MIGRATION: ADDING COLUMNS FROM CSV MAPPING
-- SADECE YENİ KOLONLARI EKLER. HİÇBİR VERİ VEYA KOLON SİLİNMEZ.
-- UNIQUE INDEX'LER BU AŞAMADA EKLENMEYECEK (IMPORT SONRASI).
-- ========================================================

-- 1. SERIES TABLOSU YENI KOLONLARI
ALTER TABLE series
ADD COLUMN IF NOT EXISTS series_name text,
ADD COLUMN IF NOT EXISTS slug_tr text,
ADD COLUMN IF NOT EXISTS slug_en text,
ADD COLUMN IF NOT EXISTS product_code text,
ADD COLUMN IF NOT EXISTS category_main text,
ADD COLUMN IF NOT EXISTS category_sub text,
ADD COLUMN IF NOT EXISTS release_date date,
ADD COLUMN IF NOT EXISTS release_month_tr text,
ADD COLUMN IF NOT EXISTS release_month_en text,
ADD COLUMN IF NOT EXISTS is_limited_production boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_special_production boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS summary_tr text,
ADD COLUMN IF NOT EXISTS summary_en text,
ADD COLUMN IF NOT EXISTS collector_comment_tr text,
ADD COLUMN IF NOT EXISTS collector_comment_en text,
ADD COLUMN IF NOT EXISTS is_active boolean,
ADD COLUMN IF NOT EXISTS is_published boolean;

-- 2. MINIFIGURES TABLOSU YENI KOLONLARI
ALTER TABLE minifigures
ADD COLUMN IF NOT EXISTS figure_name text,
ADD COLUMN IF NOT EXISTS slug_tr text,
ADD COLUMN IF NOT EXISTS slug_en text,
ADD COLUMN IF NOT EXISTS figure_number text,
ADD COLUMN IF NOT EXISTS figure_code text,
ADD COLUMN IF NOT EXISTS character_name text,
ADD COLUMN IF NOT EXISTS short_description_tr text,
ADD COLUMN IF NOT EXISTS short_description_en text,
ADD COLUMN IF NOT EXISTS figure_role text,
ADD COLUMN IF NOT EXISTS figure_type text,
ADD COLUMN IF NOT EXISTS price_updated_at timestamptz,
ADD COLUMN IF NOT EXISTS rarity_level text,
ADD COLUMN IF NOT EXISTS accessory_count integer,
ADD COLUMN IF NOT EXISTS main_color text,
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active boolean,
ADD COLUMN IF NOT EXISTS is_published boolean;

