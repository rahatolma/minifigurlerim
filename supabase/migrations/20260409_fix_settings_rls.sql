-- =================================================================================
-- FAZ 4 / HATA YAPILANDIRMASI: AYAR TABLOLARI PUBLIC READ İZİNLERİ
-- OLUŞTURULMA AMACI: Ziyaretçilerin (Anonim) Hakkımızda gibi statik sayfaların görsellerini
-- Supabase `about_settings` tablosundan okuyabilmesi için gerekli açık okuma yetkisini vermek.
-- =================================================================================

DO $$ 
DECLARE 
    pol record;
BEGIN 
    -- 1. ABOUT_SETTINGS (Hakkımızda sayfası verileri)
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.about_settings'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.about_settings', pol.polname);
    END LOOP;
    ALTER TABLE public.about_settings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public read about_settings" ON public.about_settings FOR SELECT USING (true);



END $$;
