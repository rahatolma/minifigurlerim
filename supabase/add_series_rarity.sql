-- SERİLER TABLOSUNA 'NADİRLİK DERECESİ' ALANINI EKLER
-- Bu script'i Supabase SQL editöründe çalıştır.

ALTER TABLE series ADD COLUMN IF NOT EXISTS rarity VARCHAR(255) DEFAULT 'Yaygın';

-- Mevcut boş olanlara varsayılan değer atama
UPDATE series SET rarity = 'Yaygın' WHERE rarity IS NULL;
