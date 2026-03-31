-- 1. Yeni Kolonlar
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Eğer ilk defa çalıştırıyorsan ve önceden üye olan hesapların varsa (özellikle kendini admin yapmak için):
-- LÜTFEN KULLANICI ID'Nİ GİREREK KENDİNİ ADMİN YAP VEYA AŞAĞIDAKİNİ ÇALIŞTIRIP HERKESİ ONAYLA:
-- UPDATE public.profiles SET is_approved = true WHERE is_approved IS NULL;

-- 3. Yetkili (Admin) Rolü için RLS Politikaları
-- Normade sadece "kendi güncelleyebilir" politikası vardı. Adminler de güncelleyebilsin diye yeni policy ekliyoruz:

DROP POLICY IF EXISTS "Adminler tüm profilleri güncelleyebilir" ON public.profiles;
CREATE POLICY "Adminler tüm profilleri güncelleyebilir" 
ON public.profiles FOR UPDATE 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Adminlerin kullanıcı koleksiyonlarına / yorumlarına müdahale edebilmesi için (Gelecek Vizyon):
-- DROP POLICY IF EXISTS "Adminler tüm koleksiyonları güncelleyebilir" ON public.user_collections;
-- CREATE POLICY "Adminler tüm koleksiyonları güncelleyebilir" ON public.user_collections FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
