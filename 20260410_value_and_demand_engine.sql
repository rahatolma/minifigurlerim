-- 20260410_value_and_demand_engine.sql

-- 1. YENİ KOLONLARI EKLEYELİM
ALTER TABLE minifigures 
ADD COLUMN IF NOT EXISTS min_price NUMERIC(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_price NUMERIC(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS avg_price NUMERIC(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rarity_score INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS series_score INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS view_count_30d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS collection_count_30d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_count_30d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS value_score NUMERIC(3,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS demand_score NUMERIC(3,1) DEFAULT NULL;

-- 2. HESAPLAMA FONKSİYONU (TRIGGER) OLUŞTURALIM
CREATE OR REPLACE FUNCTION calc_value_and_demand_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- VALUE SCORE HESAPLAMASI (Max: 5.0)
  -- Formül: Rarity (1-5) [%40] + Series Score (1-5) [%20] + Fiyat Katsayısı [%40]
  -- Basit fiyat katsayısı: avg_price / 10 (max 5)
  DECLARE
    v_price NUMERIC := 0;
    v_price_score NUMERIC := 0;
    v_raw_val NUMERIC := 0;
    d_raw_val NUMERIC := 0;
  BEGIN
    IF NEW.avg_price IS NOT NULL THEN
      v_price := NEW.avg_price;
    ELSIF NEW.value_usd IS NOT NULL THEN
      v_price := NEW.value_usd;
    END IF;

    IF v_price > 0 THEN
       v_price_score := LEAST(5.0, v_price / 10.0);
    ELSE
       v_price_score := 1.0;
    END IF;

    -- Rarity ve Series fallback to 1
    v_raw_val := (COALESCE(NEW.rarity_score, 1) * 0.4) + (COALESCE(NEW.series_score, 1) * 0.2) + (v_price_score * 0.4);
    NEW.value_score := ROUND(v_raw_val, 1);

    -- DEMAND SCORE HESAPLAMASI (Max: 5.0)
    -- Etkileşimler üzerinden basit logaritmik veya lineer benzeri bir model
    -- view_count, collection, favorite
    d_raw_val := LEAST(5.0, (
       COALESCE(NEW.view_count_30d, 0) * 0.01 + 
       COALESCE(NEW.collection_count_30d, 0) * 0.1 + 
       COALESCE(NEW.favorite_count_30d, 0) * 0.05
    ));
    
    -- Minimum limit (hiç etkileşim yoksa Düşük Talep - 1.0)
    IF d_raw_val < 1.0 THEN
       d_raw_val := 1.0;
    END IF;

    NEW.demand_score := ROUND(d_raw_val, 1);

  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGER'I BAĞLAYALIM
DROP TRIGGER IF EXISTS trg_calc_value_and_demand_scores ON minifigures;
CREATE TRIGGER trg_calc_value_and_demand_scores
BEFORE INSERT OR UPDATE OF min_price, max_price, avg_price, value_usd, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d
ON minifigures
FOR EACH ROW
EXECUTE FUNCTION calc_value_and_demand_scores();
