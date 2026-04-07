ALTER TABLE public.series
ADD COLUMN IF NOT EXISTS slug_en text,
ADD COLUMN IF NOT EXISTS meta_title_en text,
ADD COLUMN IF NOT EXISTS meta_description_en text;

ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS slug_en text,
ADD COLUMN IF NOT EXISTS meta_title_en text,
ADD COLUMN IF NOT EXISTS meta_description_en text;

-- TR SEO columns might also be needed if they don't exist, but usually we use 'title' or 'summary' or Next.js generates them. Let's explicitly add them for TR if we want a dedicated SEO manager.
-- Wait, 'slug' already exists. We can just add meta_title and meta_description.
ALTER TABLE public.series
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;

ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;
