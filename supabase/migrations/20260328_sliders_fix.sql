-- Supabase RLS Fix for home_sliders
-- Hata nedeni: INSERT işlemleri için kuralların "WITH CHECK" ile doğrulanması gerekir.

DROP POLICY IF EXISTS "Allow authenticated full access on home_sliders" ON public.home_sliders;

CREATE POLICY "Allow authenticated full access on home_sliders"
    ON public.home_sliders FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
