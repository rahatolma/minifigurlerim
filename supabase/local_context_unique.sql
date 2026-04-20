-- Temizleme işlemi (Önceki global eşsizlik kilitlerini kaldırıyoruz)
DROP INDEX IF EXISTS unique_slug_tr_published;
DROP INDEX IF EXISTS unique_slug_en_published;
ALTER TABLE minifigures DROP CONSTRAINT IF EXISTS minifigures_slug_key;

-- Yeni Mimarimiz: Composite Local Context Uniqueness (Aynı seri içinde aynı slug tekrar edemez)
CREATE UNIQUE INDEX IF NOT EXISTS unique_slug_tr_per_series 
ON minifigures(series_id, LOWER(TRIM(slug_tr))) 
WHERE is_published = true AND slug_tr IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_slug_en_per_series 
ON minifigures(series_id, LOWER(TRIM(slug_en))) 
WHERE is_published = true AND slug_en IS NOT NULL;
