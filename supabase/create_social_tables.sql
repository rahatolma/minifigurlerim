-- 1) `profiles` Tablosu
-- auth.users ile birebir eşleşir. Kullanıcının herkes açık bilgileri burada durur.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes profilleri görebilir" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2) auth.users tablosuna kayıt oldukça otomatik profiles tablosuna ekleme Trigger'ı
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı sadece bir kere kurmak için drop atıyoruz
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3) `user_collections` Tablosu
-- "Bende Var" veya "İstiyorum" (Sahip Olma / Arzu Listesi)
CREATE TABLE IF NOT EXISTS public.user_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  minifigure_id UUID REFERENCES public.minifigures(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('have', 'want')),
  acquired_price NUMERIC, -- Satın aldıysa kaça aldığını izleyebilmesi için (Borsa mantığı)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, minifigure_id) -- Bir kullanıcı bir figürü 2 kez listesine alamaz.
);

ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Koleksiyonları herkes görebilir" ON public.user_collections FOR SELECT USING (true);
CREATE POLICY "Kullanıcı kendi koleksiyonunu ekleyebilir" ON public.user_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcı kendi koleksiyonunu güncelleyebilir" ON public.user_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcı kendi koleksiyonunu silebilir" ON public.user_collections FOR DELETE USING (auth.uid() = user_id);


-- 4) `user_ratings` Tablosu
-- Letterboxd benzeri 5 Yıldızlı Değerlendirme & Yorum Sistemi
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  minifigure_id UUID REFERENCES public.minifigures(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photo_url TEXT, -- Orijinal figür fotoğrafını yüklerse diye
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, minifigure_id) -- Bir kullanıcı bir figüre en fazla 1 yorum bırakabilir.
);

ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Puanlamaları herkes görebilir" ON public.user_ratings FOR SELECT USING (true);
CREATE POLICY "Kullanıcı kendi puanını verebilir" ON public.user_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcı kendi puanını güncelleyebilir" ON public.user_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcı kendi puanını silebilir" ON public.user_ratings FOR DELETE USING (auth.uid() = user_id);
