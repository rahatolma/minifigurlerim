-- 1. Seriler Tablosuna "Genel Görsel" Eklemesi
ALTER TABLE series
ADD COLUMN IF NOT EXISTS general_image_url text;

-- 2. Hakkımızda Sayfası Dinamik Ayar Tablosu
CREATE TABLE IF NOT EXISTS about_settings (
    id int primary key default 1,
    hero_image_url text,
    quote_text text,
    quote_author text,
    boss_image_url text,
    boss_title text,
    boss_subtitle text,
    boss_desc text,
    main_title text,
    main_text text,
    mid_image_url text,
    mid_title text,
    mid_subtitle text,
    mid_desc text,
    small_image_url text,
    small_title text,
    small_subtitle text,
    small_desc text,
    join_image_url text,
    join_title text,
    join_text text,
    join_btn_text text,
    join_btn_link text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Her zaman 1 numaralı id'nin DB'de olmasını garanti altına alalım
INSERT INTO about_settings (id, main_title) 
VALUES (1, 'Hakkımızda') 
ON CONFLICT (id) DO NOTHING;
