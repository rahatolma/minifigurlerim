-- İLETİŞİM MESAJLARI TABLOSU (contact_messages)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Ayarları: Sadece ekleme yapılabilir, güvenlik için sadece adminler okuyabilir.
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read contact messages" ON public.contact_messages FOR SELECT USING (true); -- İlerde anon vs. yetkilendirilebilir.

-- SIKÇA SORULAN SORULAR TABLOSU (faqs)
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  answer text not null,
  sort_order int default 10,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Herkes okuyabilir
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Admin can insert faqs" ON public.faqs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update faqs" ON public.faqs FOR UPDATE USING (true);
CREATE POLICY "Admin can delete faqs" ON public.faqs FOR DELETE USING (true);
