-- HABERLER VE YORUMLAR TABLOLARI OLUŞTURMA SCRIPT'I
-- Bu scripti Supabase SQL Editor üzerinden çalıştırın.

-- 1. YENİ HABERLER TABLOSU
CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  summary text,              -- Ana saftadaki kartlarda çıkacak 1-2 cümlelik özet
  content text,              -- Yazının tam metni (HTML)
  cover_image_url text,      -- Haberin kapak fotoğrafı
  status text DEFAULT 'published', -- 'published' veya 'draft'
  total_views integer DEFAULT 0,
  daily_views integer DEFAULT 0,
  min_read integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. YORUMLAR TABLOSU (Haberler, Figürler veya Seriler için Genel)
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type text NOT NULL, -- 'news', 'series', 'figure'
  entity_id uuid NOT NULL,   -- Hangi habere/figüre/seriye ait olduğu
  user_name text NOT NULL,   -- Yorumu yapan kişinin adı (İleride user_id ile relation da eklenebilir)
  user_id uuid,              -- Üyelik sistemi tam aktif olduğunda auth.users tablosu id'si (opsiyonel)
  content text NOT NULL,     -- Yorum metni
  status text DEFAULT 'pending', -- 'approved', 'pending', 'rejected' (Admin onayından geçebilir)
  created_at timestamp with time zone DEFAULT now()
);

-- Depolama için de 'news-images' adında public bucket açılmasını öneririz.
