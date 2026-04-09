-- =================================================================================
-- FAZ 3.5.2: KALAN RLS ALWAYS TRUE TEMİZLİĞİ VE SIKILAŞTIRMA (IDEMPOTENT)
-- OLUŞTURULMA AMACI: Categories, FAQs ve Definition tablosunda kazara açılan yazma yetkilerini kilitlemek.
-- =================================================================================

DO $$ 
DECLARE 
    pol record;
BEGIN 
    -- 1. CATEGORIES Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.categories'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.categories', pol.polname);
    END LOOP;
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    -- Sadece okuma public. Ekleme/Çıkarma işlemi sadece DAL üzerinden Service Role ile yapılmalı.
    CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

    -- 2. DEFINITION_GROUPS Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.definition_groups'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.definition_groups', pol.polname);
    END LOOP;
    ALTER TABLE public.definition_groups ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public read definition_groups" ON public.definition_groups FOR SELECT USING (true);

    -- 3. FAQS Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.faqs'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.faqs', pol.polname);
    END LOOP;
    ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT USING (true);

END $$;
