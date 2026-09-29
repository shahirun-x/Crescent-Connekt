-- Crescent Connekt — Supabase schema
-- Run this in the Supabase SQL editor. The site works without a database
-- (it falls back to bundled seed data in lib/seed.ts), but this enables live
-- events, news and the contact / early-access forms.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- institutions
-- ---------------------------------------------------------------------------
create table if not exists public.institutions (
  id              text primary key,
  name            text not null,
  location        text not null,
  city            text not null,
  established_year integer,
  category        text not null check (category in ('education','healthcare','community','innovation')),
  description     text not null default '',
  external_url    text not null default '',
  logo_url        text,
  latitude        double precision,
  longitude       double precision,
  parent_org      text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

-- For databases created before parent_org was added.
alter table public.institutions add column if not exists parent_org text;

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id             text primary key default gen_random_uuid()::text,
  title          text not null,
  date_start     date not null,
  date_end       date,
  institution_id text references public.institutions(id) on delete set null,
  category       text not null check (category in
                   ('Schools','Colleges','University','Healthcare','Alumni',
                    'Community','Sports','Cultural','Conferences')),
  location       text not null default '',
  description    text not null default '',
  is_featured    boolean not null default false,
  created_at     timestamptz not null default now()
);
create index if not exists events_date_start_idx on public.events (date_start);

-- ---------------------------------------------------------------------------
-- news
-- ---------------------------------------------------------------------------
create table if not exists public.news (
  id             text primary key default gen_random_uuid()::text,
  title          text not null,
  summary        text not null default '',
  content        text not null default '',
  institution_id text references public.institutions(id) on delete set null,
  published_at   date not null default current_date,
  image_url      text,
  created_at     timestamptz not null default now()
);
create index if not exists news_published_at_idx on public.news (published_at desc);

-- ---------------------------------------------------------------------------
-- contacts  (contact form submissions)
-- ---------------------------------------------------------------------------
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- connect_signups  (Member Network early-access list)
-- ---------------------------------------------------------------------------
create table if not exists public.connect_signups (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  role       text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
--   * institutions / events / news : public read only
--   * contacts / connect_signups   : public insert only (no read)
-- ---------------------------------------------------------------------------
alter table public.institutions    enable row level security;
alter table public.events          enable row level security;
alter table public.news            enable row level security;
alter table public.contacts        enable row level security;
alter table public.connect_signups enable row level security;

create policy "public read institutions" on public.institutions
  for select using (true);
create policy "public read events" on public.events
  for select using (true);
create policy "public read news" on public.news
  for select using (true);

create policy "public insert contacts" on public.contacts
  for insert with check (true);
create policy "public insert signups" on public.connect_signups
  for insert with check (true);
create policy "public upsert signups" on public.connect_signups
  for update using (true) with check (true);
