-- ============================================================================================== --
-- MIGRATION A: Schema Setup & Definition Seeding (ŞU AN ÇALIŞTIRABİLİRSİNİZ)
-- ============================================================================================== --

-- MIGRATION A - 0. UNIQUE CONSTRAINT GÜVENCESİ
-- Kategori tiplerinin kendi içinde isim tekilliğini garanti altına alıyoruz.
CREATE UNIQUE INDEX IF NOT EXISTS categories_type_name_idx ON public.categories (type, name);

-- MIGRATION A - 1. CATEGORIES Seed
-- Not: Seed işleminde öncelikli olarak 'figure_role' veya 'figure_type' canonical kolonları taranır, 
-- boşsa eski 'role' veya 'type' fallback alınır.

INSERT INTO public.categories (type, name, slug)
SELECT DISTINCT 
  'figur-rolu', 
  TRIM(COALESCE(figure_role, role)), 
  LOWER(REPLACE(TRIM(COALESCE(figure_role, role)), ' ', '-')) || '-' || SUBSTRING(gen_random_uuid()::text, 1, 6)
FROM public.minifigures m
WHERE COALESCE(figure_role, role) IS NOT NULL 
  AND TRIM(COALESCE(figure_role, role)) != '' 
  AND NOT EXISTS (
      SELECT 1 FROM public.categories c 
      WHERE c.type = 'figur-rolu' AND c.name = TRIM(COALESCE(m.figure_role, m.role))
  )
ON CONFLICT (type, name) DO NOTHING;

INSERT INTO public.categories (type, name, slug)
SELECT DISTINCT 
  'figur-tipi', 
  TRIM(COALESCE(figure_type, type)),
  LOWER(REPLACE(TRIM(COALESCE(figure_type, type)), ' ', '-')) || '-' || SUBSTRING(gen_random_uuid()::text, 1, 6)
FROM public.minifigures m
WHERE COALESCE(figure_type, type) IS NOT NULL 
  AND TRIM(COALESCE(figure_type, type)) != '' 
  AND NOT EXISTS (
      SELECT 1 FROM public.categories c 
      WHERE c.type = 'figur-tipi' AND c.name = TRIM(COALESCE(m.figure_type, m.type))
  )
ON CONFLICT (type, name) DO NOTHING;

-- Nadirlik (Değer) Skoru Sabitleri
-- Rarity işlemleri için referans kaynağı: `rarity_score` (1-5) 
INSERT INTO public.categories (type, name, slug) VALUES 
('nadirlik-derecesi', 'Çok Yaygın', 'cok-yaygin-' || SUBSTRING(gen_random_uuid()::text, 1, 6)),
('nadirlik-derecesi', 'Yaygın', 'yaygin-' || SUBSTRING(gen_random_uuid()::text, 1, 6)),
('nadirlik-derecesi', 'Nadir', 'nadir-' || SUBSTRING(gen_random_uuid()::text, 1, 6)),
('nadirlik-derecesi', 'Çok Nadir', 'cok-nadir-' || SUBSTRING(gen_random_uuid()::text, 1, 6)),
('nadirlik-derecesi', 'Efsanevi', 'efsanevi-' || SUBSTRING(gen_random_uuid()::text, 1, 6))
ON CONFLICT (type, name) DO NOTHING;


-- MIGRATION A - 2. YENİ KOLONLARIN AÇILMASI
ALTER TABLE public.minifigures 
ADD COLUMN IF NOT EXISTS figure_role_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS figure_type_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS rarity_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;


-- ============================================================================================== --
-- DİKKAT: KODLAR DUAL-READ (ROLE_ID || ROLE) OLARAK DEPLOY EDİLDİKTEN SONRA AŞAĞIDAKİLER ÇALIŞTIRILMALIDIR
-- ============================================================================================== --

-- MIGRATION B: Data Backfill Mapper
/*
UPDATE public.minifigures m
SET figure_role_id = c.id 
FROM public.categories c 
WHERE c.type = 'figur-rolu' AND TRIM(COALESCE(m.figure_role, m.role)) = c.name;

UPDATE public.minifigures m
SET figure_type_id = c.id 
FROM public.categories c 
WHERE c.type = 'figur-tipi' AND TRIM(COALESCE(m.figure_type, m.type)) = c.name;

-- Rarity Source of Truth `rarity_score` olduğu için doğrudan maplenir.
UPDATE public.minifigures m
SET rarity_id = c.id 
FROM public.categories c 
WHERE c.type = 'nadirlik-derecesi' AND (
   (m.rarity_score = 1 AND c.name = 'Çok Yaygın') OR
   (m.rarity_score = 2 AND c.name = 'Yaygın') OR
   (m.rarity_score = 3 AND c.name = 'Nadir') OR
   (m.rarity_score = 4 AND c.name = 'Çok Nadir') OR
   (m.rarity_score = 5 AND c.name = 'Efsanevi')
);
*/
