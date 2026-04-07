-- Add English localization columns to series
ALTER TABLE public.series
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS description_blocks_en JSONB;

-- Add English localization columns to minifigures
ALTER TABLE public.minifigures
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS series_name_en TEXT,
ADD COLUMN IF NOT EXISTS role_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Add English localization columns to news
ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS content_blocks_en JSONB;

-- You can run this file directly in the Supabase SQL Editor.
