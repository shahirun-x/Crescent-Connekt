-- Crescent Connekt — schema migration for admin dashboard
-- Run AFTER schema.sql in the Supabase SQL editor.

-- contacts: track read/unread status
alter table public.contacts add column if not exists is_read boolean not null default false;

-- contacts: add updated_at
alter table public.contacts add column if not exists updated_at timestamptz not null default now();

-- connect_signups: ensure unique email (schema.sql already has it, this is idempotent)
-- alter table public.connect_signups add constraint if not exists connect_signups_email_key unique (email);
-- (the `if not exists` syntax isn't supported for constraints — the original schema already declares `unique`)

-- connect_signups: add name column
alter table public.connect_signups add column if not exists name text;

-- connect_signups: add updated_at
alter table public.connect_signups add column if not exists updated_at timestamptz not null default now();

-- events: add updated_at
alter table public.events add column if not exists updated_at timestamptz not null default now();

-- news: add updated_at
alter table public.news add column if not exists updated_at timestamptz not null default now();

-- institutions: add updated_at
alter table public.institutions add column if not exists updated_at timestamptz not null default now();

-- Auto-update updated_at on row changes
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in select unnest(array['institutions','events','news','contacts','connect_signups'])
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I; '
      'create trigger set_updated_at before update on public.%I '
      'for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS policies for authenticated admin users (INSERT / UPDATE / DELETE)
-- These complement the existing public-read policies from schema.sql.
-- ---------------------------------------------------------------------------

-- Helper: check if the requesting user is authenticated
-- (Any Supabase Auth user counts as admin for now. For role-based access,
--  add a check against a custom claim or an admin_users table.)

-- institutions: admin write
create policy "admin write institutions" on public.institutions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- events: admin write
create policy "admin write events" on public.events
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- news: admin write
create policy "admin write news" on public.news
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- contacts: admin read + update (mark as read)
create policy "admin read contacts" on public.contacts
  for select using (auth.role() = 'authenticated');
create policy "admin update contacts" on public.contacts
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- connect_signups: admin read
create policy "admin read signups" on public.connect_signups
  for select using (auth.role() = 'authenticated');
