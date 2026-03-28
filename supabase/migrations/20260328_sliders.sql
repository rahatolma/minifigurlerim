-- Create home_sliders table
CREATE TABLE IF NOT EXISTS public.home_sliders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    button1_text TEXT,
    button1_link TEXT,
    button2_text TEXT,
    button2_link TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.home_sliders ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read access on home_sliders"
    ON public.home_sliders FOR SELECT
    USING (true);

-- Allow authenticated (admin) write
CREATE POLICY "Allow authenticated full access on home_sliders"
    ON public.home_sliders FOR ALL
    USING (auth.role() = 'authenticated');
