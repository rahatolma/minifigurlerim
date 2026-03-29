-- Migration: Add vertical cover image to news
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS cover_image_vertical_url text;
