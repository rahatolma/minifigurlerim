-- 1. Kategoriler tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Herkes kategorileri görebilir" ON public.categories;
CREATE POLICY "Herkes kategorileri görebilir" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Kategori ekleme" ON public.categories;
CREATE POLICY "Kategori ekleme" ON public.categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Kategori guncelleme" ON public.categories;
CREATE POLICY "Kategori guncelleme" ON public.categories FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Kategori silme" ON public.categories;
CREATE POLICY "Kategori silme" ON public.categories FOR DELETE USING (true);

-- 2. Seriler tablosunu güncelle (Tarihi ayır, ekstra açıklamalar ekle)
ALTER TABLE public.series
DROP COLUMN IF EXISTS release_date,
ADD COLUMN IF NOT EXISTS release_month TEXT,
ADD COLUMN IF NOT EXISTS release_year TEXT,
ADD COLUMN IF NOT EXISTS description_2 TEXT;

-- 3. SCHEMA CACHE TEMİZLEMESİ (Hatayı Çözer)
NOTIFY pgrst, 'reload schema';
