ALTER TABLE public.series 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS box_image_url TEXT,
ADD COLUMN IF NOT EXISTS collector_image_url TEXT;

NOTIFY pgrst, 'reload schema';
