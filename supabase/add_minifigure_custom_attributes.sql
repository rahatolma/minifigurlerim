ALTER TABLE public.minifigures ADD COLUMN IF NOT EXISTS custom_attributes JSONB DEFAULT '{}'::jsonb;
NOTIFY pgrst, 'reload schema';
