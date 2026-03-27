ALTER TABLE public.series 
ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'LEGO®',
ADD COLUMN IF NOT EXISTS series_no TEXT,
ADD COLUMN IF NOT EXISTS collector_note TEXT;

NOTIFY pgrst, 'reload schema';
