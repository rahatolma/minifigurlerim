-- Ana Tanım Grupları Tablosu
CREATE TABLE IF NOT EXISTS public.definition_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
);

-- İlk (Varsayılan) Tanım Gruplarını Seed Et
INSERT INTO public.definition_groups (name, slug) VALUES 
('Seri Kategorisi', 'seri_kategori'),
('Figür Rolü', 'figur_rolu'),
('Figür Tipi', 'figur_tipi'),
('Figür Nadirliği', 'figur_nadirliği')
ON CONFLICT (slug) DO NOTHING;

-- Güvenlik (RLS) Politikaları
ALTER TABLE public.definition_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select" ON public.definition_groups;
CREATE POLICY "Public Select" ON public.definition_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert" ON public.definition_groups;
CREATE POLICY "Public Insert" ON public.definition_groups FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Delete" ON public.definition_groups;
CREATE POLICY "Public Delete" ON public.definition_groups FOR DELETE USING (true);

-- Supabase REST API Önbelleğini Yenile
NOTIFY pgrst, 'reload schema';
