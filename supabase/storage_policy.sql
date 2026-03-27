-- 1. minfigure-images adında bucket oluştur (Eğer yoksa)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('minifigure-images', 'minifigure-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Dikkat: Sahip (owner) hatası almamak için ALTER TABLE komutu KALDIRILDI.

-- 2. Herkesin görselleri OKUMASINA (SELECT) izin ver
DROP POLICY IF EXISTS "Görselleri herkes görebilir" ON storage.objects;
CREATE POLICY "Görselleri herkes görebilir" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'minifigure-images');

-- 3. Yetkilendirme şimdilik anonim (Admin girişi deaktif olduğu için) YÜKLEMEYE (INSERT) izin ver
DROP POLICY IF EXISTS "Görsel yüklemeye izin ver" ON storage.objects;
CREATE POLICY "Görsel yüklemeye izin ver" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'minifigure-images');

-- 4. Görsel SİLİNMESİNE izin ver
DROP POLICY IF EXISTS "Görsel silmeye izin ver" ON storage.objects;
CREATE POLICY "Görsel silmeye izin ver" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'minifigure-images');

-- 5. Görsel GÜNCELLENMESİNE izin ver
DROP POLICY IF EXISTS "Görsel guncellemeye izin ver" ON storage.objects;
CREATE POLICY "Görsel guncellemeye izin ver" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'minifigure-images');
