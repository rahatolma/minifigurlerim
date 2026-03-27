-- 1. Seriler (Series) Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    series_no TEXT,
    brand TEXT DEFAULT 'LEGO®',
    cover_image_url TEXT,
    figure_count INTEGER,
    release_date TEXT,
    total_views INTEGER DEFAULT 0,
    daily_views INTEGER DEFAULT 0
);

-- 2. Minifigürler (Minifigures) Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.minifigures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT DEFAULT 'LEGO®',
    category TEXT,
    series_name TEXT,
    series_no TEXT,
    figure_no TEXT,
    role TEXT,
    type TEXT,
    code TEXT,
    piece_count INTEGER,
    body_material TEXT,
    rarity TEXT,
    value_usd NUMERIC,
    release_year TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    total_views INTEGER DEFAULT 0,
    daily_views INTEGER DEFAULT 0
);

-- 3. Row Level Security (RLS) İzinlerini Ayarla (Public okuma/yazma için - Test ve Geliştirme Ortamı)
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minifigures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes serileri görebilir" ON public.series FOR SELECT USING (true);
CREATE POLICY "Herkes minifigürleri görebilir" ON public.minifigures FOR SELECT USING (true);

-- Not: Dashboard üzerinden tablo güncelleyebilmek için INSERT/UPDATE politikaları da eklendi. (İleride sadece Admin olarak kısıtlanacaktır)
CREATE POLICY "Seri ekleme" ON public.series FOR INSERT WITH CHECK (true);
CREATE POLICY "Figür ekleme" ON public.minifigures FOR INSERT WITH CHECK (true);
CREATE POLICY "Seri güncelleme" ON public.series FOR UPDATE USING (true);
CREATE POLICY "Figür güncelleme" ON public.minifigures FOR UPDATE USING (true);

-- 4. Görseller için Storage (Bucket) Alanı Oluştur (Eğer arayüzden yapmadıysan bu komutu da çalıştırabilirsin)
INSERT INTO storage.buckets (id, name, public) VALUES ('minifigure-images', 'minifigure-images', true) ON CONFLICT DO NOTHING;
