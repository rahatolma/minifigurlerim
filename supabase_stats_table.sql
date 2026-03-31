-- ========================================================
-- 🏆 OYUNLAŞTIRMA v2: GAMIFICATION CACHE TABLOSU YAPISI
-- ========================================================
-- Lütfen bu kodları Supabase -> SQL Editor içerisine yapıştırıp "Run" butonuna bas kankam.

-- 1. Cache (Önbellek) tablomuzu oluşturuyoruz:
CREATE TABLE IF NOT EXISTS public.user_series_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    series_name TEXT,
    owned_count INT NOT NULL DEFAULT 0,
    total_count INT NOT NULL DEFAULT 0,
    completion_percent NUMERIC (5,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, series_id) -- Bu constraint sayesinde aynı adam aynı seriye ikinci bir kayıt açamaz, üzerine yazar (UPSERT).
);

-- 2. Güvenlik ve RLS (Row Level Security) Ayarları
-- Bu tablo herkesin verisinin karışmasını engeller.
ALTER TABLE public.user_series_stats ENABLE ROW LEVEL SECURITY;

-- Politikalar (Herkes kendi ilerlemesini görebilir, yazma işlemi ise sadece sistem (servis rolü) tarafından yapılacaktır.)
CREATE POLICY "Kullanıcılar kendi serilerinin yuzdelerini gorebilir"
    ON public.user_series_stats FOR SELECT
    USING (auth.uid() = user_id);

-- Servis rolünün (backend) yazabilmesi için zaten varsayılan bypass izni vardır, ek policy'e gerek yok.

-- ========================================================
-- 🎉 İŞLEM TAMAM! 
-- Bu çalıştıysa, hemen backend'e React Server Actions ile Tetikleyici mekanizmasını bağlıyorum!
-- ========================================================
