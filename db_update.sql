-- Seri tablosundaki mevcut rarity alanının ismini değiştiriyoruz
ALTER TABLE series RENAME COLUMN rarity TO manual_rarity;

-- Yeni otomasyon alanlarını ekliyoruz
ALTER TABLE series ADD COLUMN computed_rarity text;
ALTER TABLE series ADD COLUMN final_rarity text;

-- Halihazırda var olan series verileri için final_rarity'yi ilk geçiş olarak dolduruyoruz:
UPDATE series SET final_rarity = manual_rarity;
