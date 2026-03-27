ALTER TABLE public.minifigures ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.minifigures ADD COLUMN IF NOT EXISTS release_month TEXT;

NOTIFY pgrst, 'reload schema';
