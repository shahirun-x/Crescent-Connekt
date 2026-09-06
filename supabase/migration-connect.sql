-- Crescent Global — Crescent Connect Phase 1
-- Member accounts, profiles and the members-only directory.
-- Run AFTER schema.sql, migration-admin.sql and migration-images.sql.
-- Idempotent and safe to re-run.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- admins
--
-- SECURITY: before Crescent Connect there was no public signup, so every row
-- in auth.users was an administrator and "is this a valid Supabase user?" was
-- a sufficient admin check. Public member signup breaks that assumption — any
-- member would hold a valid token. This table makes administrator a distinct,
-- explicit grant. The bootstrap below runs once, at migration time, while the
-- only existing auth users are still the real administrators.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  note       text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- No policies: only the service role (which bypasses RLS) may read or write.

-- Bootstrap: promote every pre-existing auth user to admin. At this point no
-- member has signed up yet, so this captures exactly the current admins.
insert into public.admins (user_id, note)
select id, 'bootstrapped by migration-connect.sql'
from auth.users
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text not null,
  role             text not null check (role in
                     ('student','alumni','faculty','management',
                      'parent','entrepreneur','wellwisher')),
  institution_id   text references public.institutions(id) on delete set null,
  batch_year       integer,
  current_city     text,
  current_country  text default 'India',
  headline         text,
  bio              text,
  avatar_url       text,
  linkedin_url     text,
  status           text not null default 'pending' check (status in
                     ('pending','approved','rejected','suspended')),
  rejection_reason text,
  show_email       boolean not null default false,
  show_phone       boolean not null default false,
  phone            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Columns added after an earlier install
alter table public.profiles add column if not exists rejection_reason text;

create index if not exists profiles_status_idx      on public.profiles (status);
create index if not exists profiles_role_idx        on public.profiles (role);
create index if not exists profiles_institution_idx on public.profiles (institution_id);
create index if not exists profiles_batch_year_idx  on public.profiles (batch_year);
create index if not exists profiles_created_at_idx  on public.profiles (created_at desc);

-- Reuse the shared updated_at trigger from migration-admin.sql
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper: is the caller an approved member?
--
-- SECURITY DEFINER so the lookup does not re-enter the profiles RLS policy
-- that calls it — without this the SELECT policy would recurse infinitely.
-- ---------------------------------------------------------------------------
create or replace function public.is_approved_member()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

revoke all on function public.is_approved_member() from public;
grant execute on function public.is_approved_member() to authenticated;

-- ---------------------------------------------------------------------------
-- Guard: members may edit their own profile but never their own status.
--
-- RLS is row-level, not column-level, so an UPDATE policy cannot stop a member
-- from setting status='approved' on their own row. This trigger enforces it.
-- Service-role calls (the admin routes) have auth.uid() = null and pass.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;                       -- service role / server-side admin route
  end if;

  if new.status is distinct from old.status then
    raise exception 'status may only be changed by an administrator';
  end if;

  if new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'rejection_reason may only be changed by an administrator';
  end if;

  if new.id is distinct from old.id then
    raise exception 'profile id is immutable';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "members read approved profiles" on public.profiles;
drop policy if exists "members insert own profile"     on public.profiles;
drop policy if exists "members update own profile"     on public.profiles;

-- Read: always your own row; other rows only when BOTH you and they are
-- approved. Anonymous callers match nothing, so the directory is members-only.
create policy "members read approved profiles" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or (status = 'approved' and public.is_approved_member())
  );

-- Insert: only your own row, and only ever as 'pending'.
create policy "members insert own profile" on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and status = 'pending');

-- Update: only your own row. The trigger above blocks privileged columns.
create policy "members update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- directory_profiles view
--
-- RLS cannot hide individual COLUMNS, so email and phone are masked here based
-- on each member's own show_email / show_phone consent flags. The directory and
-- member-detail pages read from this view, never from profiles directly, so a
-- contact detail can never leak through a stray select('*').
--
-- security_invoker = true keeps the caller's RLS on profiles in force, so the
-- view cannot widen row visibility. Email lives in auth.users, hence the join.
--
-- Access control is deliberately two-layered:
--   1. Column masking (the CASE expressions below) applies to EVERY caller,
--      including the service role. A contact detail cannot leak by accident.
--   2. Row access is enforced by the API routes, which verify the caller is an
--      approved member and filter to status = 'approved' before querying.
-- Because the view is security_invoker, a direct query with an anon or
-- authenticated key fails closed rather than over-sharing.
-- ---------------------------------------------------------------------------
drop view if exists public.directory_profiles;
create view public.directory_profiles
with (security_invoker = true) as
select
  p.id,
  p.full_name,
  p.role,
  p.institution_id,
  i.name as institution_name,
  p.batch_year,
  p.current_city,
  p.current_country,
  p.headline,
  p.bio,
  p.avatar_url,
  p.linkedin_url,
  p.status,
  p.show_email,
  p.show_phone,
  case when p.show_email then u.email::text else null end as email,
  case when p.show_phone then p.phone        else null end as phone,
  p.created_at
from public.profiles p
join auth.users u on u.id = p.id
left join public.institutions i on i.id = p.institution_id;

grant select on public.directory_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Note: public.connect_signups is intentionally left untouched. Those rows are
-- pre-launch early-access registrations and remain valuable as a launch list.
-- ---------------------------------------------------------------------------
