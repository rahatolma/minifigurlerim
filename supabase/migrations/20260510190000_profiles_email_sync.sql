-- 1. PROFILES TABLOSUNA EMAIL KOLONUNU EKLE
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. MEVCUT VERİLERİ BACKFILL YAP (auth.users -> profiles)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email != u.email);

-- 3. EMAIL SENKRONİZASYON TETİKLEYİCİSİ (Fonksiyon)
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. EMAIL GÜNCELLEME TETİKLEYİCİSİ (Trigger)
DROP TRIGGER IF EXISTS zzz_sync_user_email_update ON auth.users;
CREATE TRIGGER zzz_sync_user_email_update
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_user_email();

-- 5. YENİ KULLANICI KAYIT TETİKLEYİCİSİ (Trigger)
DROP TRIGGER IF EXISTS zzz_sync_user_email_insert ON auth.users;
CREATE TRIGGER zzz_sync_user_email_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_email();

-- 6. CLIENT ÜZERİNDEN EMAIL DEĞİŞİMİNİ KİLİTLE (Güvenlik)
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role text;
BEGIN
  BEGIN
    v_role := current_setting('request.jwt.claims', true)::json->>'role';
  EXCEPTION WHEN OTHERS THEN
    v_role := null;
  END;
  
  IF current_user IN ('postgres', 'service_role', 'supabase_admin') OR v_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- KORUNAN KOLONLAR (İstemci müdahale edemez)
  NEW.role := OLD.role;
  NEW.status := OLD.status;
  NEW.is_approved := OLD.is_approved;
  NEW.banned_at := OLD.banned_at;
  NEW.banned_by := OLD.banned_by;
  NEW.banned_reason := OLD.banned_reason;
  NEW.email := OLD.email; -- YENİ EKLENEN KORUMA

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRGM INDEX (Admin Search Performansı İçin)
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON public.profiles USING GIN (email gin_trgm_ops);
