-- =========================================================================
-- FAZ 3.5: RLS OPTIMIZATION & INIT PLAN (ROW-BY-ROW COST REDUCTION)
-- =========================================================================

-- Tablolarda indeks ihtiyacını karşılayalım (Postgres "seq scan" yapmasın)
CREATE INDEX IF NOT EXISTS idx_user_coll_user_id ON public.user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coll_mini_id ON public.user_collections(minifigure_id);

CREATE INDEX IF NOT EXISTS idx_user_rat_user_id ON public.user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rat_mini_id ON public.user_ratings(minifigure_id);

CREATE INDEX IF NOT EXISTS idx_stats_user_id ON public.user_series_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_stats_series_id ON public.user_series_stats(series_id);

CREATE INDEX IF NOT EXISTS idx_minifigures_series_id ON public.minifigures(series_id);


-- TEMİZLİK VE OPTİMİZASYON YORDAMI (IDEMPOTENT)
DO $$ 
DECLARE 
    pol record;
BEGIN 
    -- 1. PROFILES Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.profiles'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.polname);
    END LOOP;
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- 2. USER_COLLECTIONS Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.user_collections'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_collections', pol.polname);
    END LOOP;
    ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;

    -- 3. USER_RATINGS Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.user_ratings'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_ratings', pol.polname);
    END LOOP;
    ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

    -- 4. USER_SERIES_STATS Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.user_series_stats'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_series_stats', pol.polname);
    END LOOP;
    ALTER TABLE public.user_series_stats ENABLE ROW LEVEL SECURITY;

    -- 5. SERIES Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.series'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.series', pol.polname);
    END LOOP;
    ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

    -- 6. MINIFIGURES Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.minifigures'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.minifigures', pol.polname);
    END LOOP;
    ALTER TABLE public.minifigures ENABLE ROW LEVEL SECURITY;

    -- 7. PAGES Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.pages'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.pages', pol.polname);
    END LOOP;
    ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

    -- 8. HOME_SLIDERS Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.home_sliders'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.home_sliders', pol.polname);
    END LOOP;
    ALTER TABLE public.home_sliders ENABLE ROW LEVEL SECURITY;

    -- 9. NEWSLETTER_SUBSCRIBERS Tablosu
    FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.newsletter_subscribers'::regclass LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.newsletter_subscribers', pol.polname);
    END LOOP;
    ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
END $$;


-- =========================================================================
-- YENİ GÜVENLİK (RLS) POLİTİKALARI [O(1) InitPlan Maliyeti]
-- =========================================================================

-- 1. Profiles
-- Güvenlik Değişmedi: Herkes okuyabilir, sadece sahibi (auth) kendini yazıp değiştirebilir.
-- Optimize Edildi: auth.uid() -> (select auth.uid()) ile wrapper kullanıldı.
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ( id = (select auth.uid()) );
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ( id = (select auth.uid()) );

-- 2. User Collections
-- Güvenlik Değişmedi: Kullanıcı tüm cüzdanını okur ve yazar. (Eklemeler action_dal Service Role tarafından da yapılır)
CREATE POLICY "Users can view their own collection" ON public.user_collections FOR SELECT USING ( user_id = (select auth.uid()) );
CREATE POLICY "Users can insert their collection" ON public.user_collections FOR INSERT WITH CHECK ( user_id = (select auth.uid()) );
CREATE POLICY "Users can update their collection" ON public.user_collections FOR UPDATE USING ( user_id = (select auth.uid()) );
CREATE POLICY "Users can delete their collection" ON public.user_collections FOR DELETE USING ( user_id = (select auth.uid()) );

-- 3. User Ratings
-- Güvenlik Değişmedi: Puanları sistemdeki herkes "okuyabilir" (figür detay sayfası), ancak sadece giriş yapan kendi puanı üstünde işlem yapabilir.
CREATE POLICY "Ratings are public" ON public.user_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert their rating" ON public.user_ratings FOR INSERT WITH CHECK ( user_id = (select auth.uid()) );
CREATE POLICY "Users can update their rating" ON public.user_ratings FOR UPDATE USING ( user_id = (select auth.uid()) );
CREATE POLICY "Users can delete their rating" ON public.user_ratings FOR DELETE USING ( user_id = (select auth.uid()) );

-- 4. User Series Stats
-- Güvenlik Değişmedi: Yalnızca kullanıcının istatistiklerini kendisi (koleksiyon sayfasında) görebilir.
CREATE POLICY "Users can view their own stats" ON public.user_series_stats FOR SELECT USING ( user_id = (select auth.uid()) );

-- 5 & 6 & 7 & 8: Public Data (Series, Minifigures, Pages, Sliders)
-- Güvenlik Değişmedi: Herkesin katalog içeriğini okuma hakkı var, yazma hakları kimseye açık değil (Sadece Süper Admin/Service Role)
CREATE POLICY "Public read access for series" ON public.series FOR SELECT USING (true);
CREATE POLICY "Public read access for minifigures" ON public.minifigures FOR SELECT USING (true);
CREATE POLICY "Public read access for pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Public read access for home_sliders" ON public.home_sliders FOR SELECT USING (true);

-- 9. Newsletter Subscribers
-- Güvenlik Değişmedi: Dışarıdan anonim dahil herkes "kayıt girmelidir", kimse "okuyamaz" (Sadece Admin yetkilisi okuyabilir).
CREATE POLICY "Public insert access for newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
