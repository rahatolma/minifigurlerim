-- 1. Add new columns to minifigures table.
ALTER TABLE minifigures
ADD COLUMN IF NOT EXISTS min_price NUMERIC,
ADD COLUMN IF NOT EXISTS max_price NUMERIC,
ADD COLUMN IF NOT EXISTS avg_price NUMERIC,
ADD COLUMN IF NOT EXISTS price_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rarity_score NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS series_score NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS value_score NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS demand_score NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS view_count_30d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS collection_count_30d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_count_30d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- 2. Create the Trigger Function
CREATE OR REPLACE FUNCTION calc_value_and_demand_scores()
RETURNS TRIGGER AS $$
DECLARE
    calc_age_score NUMERIC := 1.0;
    calc_price_score NUMERIC := 1.0;
    calc_demand_score NUMERIC := 1.0;
    calc_value_score NUMERIC := 1.0;
    current_year INTEGER := extract(year from current_date);
    fig_year INTEGER;
BEGIN
    -- AGE SCORE (0-2y:1, 3-5y:2, 6-10y:3, 10+y:4)
    IF NEW.release_year IS NOT NULL AND NEW.release_year ~ '^[0-9]{4}$' THEN
        fig_year := CAST(NEW.release_year AS INTEGER);
        IF (current_year - fig_year) >= 10 THEN
            calc_age_score := 4.0;
        ELSIF (current_year - fig_year) >= 6 THEN
            calc_age_score := 3.0;
        ELSIF (current_year - fig_year) >= 3 THEN
            calc_age_score := 2.0;
        ELSE
            calc_age_score := 1.0;
        END IF;
    ELSE
        calc_age_score := 1.0;
    END IF;

    -- PRICE SCORE (avg_price based) (0-10:1, 10-25:2, 25-50:3, 50-100:4, 100+:5)
    IF NEW.avg_price IS NOT NULL THEN
        IF NEW.avg_price >= 100 THEN
            calc_price_score := 5.0;
        ELSIF NEW.avg_price >= 50 THEN
            calc_price_score := 4.0;
        ELSIF NEW.avg_price >= 25 THEN
            calc_price_score := 3.0;
        ELSIF NEW.avg_price >= 10 THEN
            calc_price_score := 2.0;
        ELSE
            calc_price_score := 1.0;
        END IF;
    END IF;

    -- DEMAND SCORE (MVP Formula: view 30%, collection 35%, favorite 25%, rating 10%)
    -- MVP Mapping to 1-5 scale roughly based on manual inputs:
    -- View Score: 100+ -> 5, 20 views -> 2
    -- We use a simple linear scaling capped at 5.0
    calc_demand_score := (LEAST(5.0, (COALESCE(NEW.view_count_30d, 0) / 25.0) + 1.0) * 0.30) +
                         (LEAST(5.0, (COALESCE(NEW.collection_count_30d, 0) / 10.0) + 1.0) * 0.35) +
                         (LEAST(5.0, (COALESCE(NEW.favorite_count_30d, 0) / 10.0) + 1.0) * 0.25) +
                         (LEAST(5.0, (COALESCE(NEW.rating_count, 0) / 5.0) + 1.0) * 0.10);
                         
    NEW.demand_score := ROUND(calc_demand_score, 2);

    -- VALUE SCORE = rarity(30) + age(20) + series(20) + demand(20) + price(10)
    calc_value_score := (COALESCE(NEW.rarity_score, 1.0) * 0.30) +
                        (calc_age_score * 0.20) +
                        (COALESCE(NEW.series_score, 1.0) * 0.20) +
                        (calc_demand_score * 0.20) +
                        (calc_price_score * 0.10);
                        
    NEW.value_score := ROUND(calc_value_score, 2);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Bind the Trigger
DROP TRIGGER IF EXISTS trg_calc_value_and_demand ON minifigures;
CREATE TRIGGER trg_calc_value_and_demand
    BEFORE INSERT OR UPDATE ON minifigures
    FOR EACH ROW
    EXECUTE FUNCTION calc_value_and_demand_scores();
