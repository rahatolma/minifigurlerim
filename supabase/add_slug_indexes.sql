-- Sadece Yayında Olan (Published) Minifigürlerin Slug'larını Benzersiz Tutan Production-Grade Kısıtlayıcılar
-- SADECE DATA CONTRACT'I KİLİTLİYORUZ (slug_tr ve slug_en). Fallback olan 'slug' alanı gereksiz conflict yaratmaması adına serbest bırakıldı.

-- Önceki indexleri (varsa) temizleyelim (hata almamak için)
DROP INDEX IF EXISTS unique_slug_tr_published;
DROP INDEX IF EXISTS unique_slug_en_published;

-- Yeni ve kısıtlayıcıları artırılmış (LOWER, TRIM ve NOT NULL) indexleri kuralım
CREATE UNIQUE INDEX unique_slug_tr_published 
ON minifigures(LOWER(TRIM(slug_tr))) 
WHERE is_published = true AND slug_tr IS NOT NULL;

CREATE UNIQUE INDEX unique_slug_en_published 
ON minifigures(LOWER(TRIM(slug_en))) 
WHERE is_published = true AND slug_en IS NOT NULL;
