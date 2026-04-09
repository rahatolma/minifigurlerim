-- =================================================================================
-- SECURITY ADVISOR YAMA VE ONARIM SCRİPTİ (IDEMPOTENT)
-- OLUŞTURULMA AMACI: Açık 'SELECT' izinli tabloları kapatmak ve Mutable Function'ları kilitlemek.
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. KRİTİK AÇIK: CONTACT_MESSAGES
-- Sorun: Eski scriptlerde USING (true) yazılarak herkesin mesaj atması ve başkasınınkini okuması sağlandı.
-- Çözüm: Tüm policy'leri sil. SADECE İNSERT hakkı tanı. Hiçbir SELECT policy oluşturma.
-- ---------------------------------------------------------------------------------
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.contact_messages'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.contact_messages', pol.polname);
    END LOOP;
END $$;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public users can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
-- DİKKAT: FOR SELECT tanımlanmadı. Yani Service Role hariç KİMSE mesajları göremez.

-- ---------------------------------------------------------------------------------
-- 2. DİSİPLİN GÜVENCESİ: NEWSLETTER_SUBSCRIBERS
-- Sorun: Yanlışlıkla okuma açılması ihtimali olan bir e-posta havuzu.
-- Çözüm: Bütün kuralları sıfırla. Kesinlikle public READ policy yapma, sadece İNSERT yap.
-- ---------------------------------------------------------------------------------
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.newsletter_subscribers'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.newsletter_subscribers', pol.polname);
    END LOOP;
END $$;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public users can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
-- DİKKAT: FOR SELECT tanımlanmadı. E-postalar sadece Service Role/Admin tarafından okunabilir.

-- ---------------------------------------------------------------------------------
-- 3. SEARCH_PATH SABİTLEMESİ (SECURITY DEFINER AÇIĞI)
-- Sorun: Supabase Advisor 'Function search path mutable' diyerek bu fonksiyonların sömürülebileceğini bildirdi.
-- Çözüm: Parametre yapıları ne olursa olsun dinamik olarak tümünü public search_path ile kilitler.
-- ---------------------------------------------------------------------------------
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT oid::regprocedure AS signature 
        FROM pg_proc 
        WHERE proname IN ('update_modified_column', 'handle_new_user', 'increment_page_view') 
          AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'ALTER FUNCTION ' || r.signature || ' SET search_path = public';
    END LOOP;
END $$;
