-- Add content_blocks JSONB array column to series table
ALTER TABLE public.series 
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;

-- Optional Comment for tracking
COMMENT ON COLUMN public.series.content_blocks IS 'Array of dynamic content blocks for detailed layout (e.g., hero, text+img, cta).';
