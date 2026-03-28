create table public.newsletter_subscribers (
    id uuid default gen_random_uuid() primary key,
    email text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Setup
alter table public.newsletter_subscribers enable row level security;

-- Herkes e-posta bırakabilir (Insert açık) ama sadece admin okuyabilir
create policy "Anyone can subscribe to newsletter"
    on public.newsletter_subscribers for insert
    with check (true);

create policy "Only admins can view subscribers"
    on public.newsletter_subscribers for select
    using (auth.role() = 'authenticated');
