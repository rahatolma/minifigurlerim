-- Create the pages table for the Dynamic CMS Module
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    title_en TEXT,
    content_blocks JSONB DEFAULT '[]'::jsonb,
    content_blocks_en JSONB,
    seo_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) if not already global
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to pages
CREATE POLICY "Public profiles are viewable by everyone."
ON public.pages FOR SELECT
USING (true);

-- Allow authenticated users to insert/update/delete (or restrict to admins)
CREATE POLICY "Authenticated users can manipulate pages."
ON public.pages FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create a generic trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pages_modtime
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
