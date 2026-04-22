-- 20260422_sync_user_collections.sql

-- Bu trigger, user_collections tablosundaki değişiklikleri (Koleksiyona Ekleme / Takip Etme)
-- minifigures tablosundaki collection_count_30d ve favorite_count_30d sütunlarına anında yansıtır.

CREATE OR REPLACE FUNCTION trg_sync_user_collections()
RETURNS TRIGGER AS $$
BEGIN
    -- YENİ KAYIT EKLENDİĞİNDE (INSERT)
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'have' THEN
            UPDATE minifigures SET collection_count_30d = COALESCE(collection_count_30d, 0) + 1 WHERE id = NEW.minifigure_id;
        ELSIF NEW.status = 'want' THEN
            UPDATE minifigures SET favorite_count_30d = COALESCE(favorite_count_30d, 0) + 1 WHERE id = NEW.minifigure_id;
        END IF;
        RETURN NEW;
    
    -- KAYIT SİLİNDİĞİNDE (DELETE)
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'have' THEN
            UPDATE minifigures SET collection_count_30d = GREATEST(COALESCE(collection_count_30d, 0) - 1, 0) WHERE id = OLD.minifigure_id;
        ELSIF OLD.status = 'want' THEN
            UPDATE minifigures SET favorite_count_30d = GREATEST(COALESCE(favorite_count_30d, 0) - 1, 0) WHERE id = OLD.minifigure_id;
        END IF;
        RETURN OLD;
        
    -- KAYIT GÜNCELLENDİĞİNDE (UPDATE - Örneğin Koleksiyondan Çıkarıp Takip Etmek)
    ELSIF TG_OP = 'UPDATE' THEN
        -- Durum değişmediyse işlem yapma
        IF OLD.status = NEW.status THEN
            RETURN NEW;
        END IF;

        -- Eski durumu düş
        IF OLD.status = 'have' THEN
            UPDATE minifigures SET collection_count_30d = GREATEST(COALESCE(collection_count_30d, 0) - 1, 0) WHERE id = OLD.minifigure_id;
        ELSIF OLD.status = 'want' THEN
            UPDATE minifigures SET favorite_count_30d = GREATEST(COALESCE(favorite_count_30d, 0) - 1, 0) WHERE id = OLD.minifigure_id;
        END IF;

        -- Yeni durumu ekle
        IF NEW.status = 'have' THEN
            UPDATE minifigures SET collection_count_30d = COALESCE(collection_count_30d, 0) + 1 WHERE id = NEW.minifigure_id;
        ELSIF NEW.status = 'want' THEN
            UPDATE minifigures SET favorite_count_30d = COALESCE(favorite_count_30d, 0) + 1 WHERE id = NEW.minifigure_id;
        END IF;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_user_collections ON user_collections;

CREATE TRIGGER trg_sync_user_collections
AFTER INSERT OR UPDATE OR DELETE ON user_collections
FOR EACH ROW
EXECUTE FUNCTION trg_sync_user_collections();
