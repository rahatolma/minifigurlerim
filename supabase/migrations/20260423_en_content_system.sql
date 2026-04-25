-- ============================================================================================== --
-- MIGRATION: EN Content System (SEO & Slugs)
-- ============================================================================================== --

-- 1. MINIFIGURES
-- Add missing SEO fields for English
ALTER TABLE public.minifigures 
ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
ADD COLUMN IF NOT EXISTS meta_description_en TEXT;

-- 2. NEWS
-- Add missing fields for English
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS slug_en TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS summary_en TEXT,
ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
ADD COLUMN IF NOT EXISTS meta_description_en TEXT;

-- (Series already has all required _en fields)
