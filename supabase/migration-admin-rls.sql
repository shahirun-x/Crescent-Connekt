-- Crescent Connekt — admin-only RLS (fixes a privilege hole)
-- Run AFTER migration-connect.sql (needs public.admins). Idempotent.
--
-- THE HOLE
--
-- migration-admin.sql gated writes and private reads on
-- auth.role() = 'authenticated'. That was correct when the only accounts were
-- administrators. migration-connect.sql opened member signup, and from then on
-- any member who confirmed an email could, straight through the Supabase API:
--   * insert / update / delete institutions, events and news
--   * read every contact-form submission and the early-access signup list
--   * upload, overwrite or delete any object in the media bucket
-- The app never needed those policies — its admin routes use the service role,
-- which bypasses RLS. They were pure exposure. See DECISIONS #31.
--
-- THE FIX
--
-- Every privileged policy now checks public.is_admin(), i.e. a row in
-- public.admins, the same grant the middleware checks. Policies are scoped
-- TO authenticated and split per command, so anonymous reads and inserts never
-- evaluate is_admin() — anon has no EXECUTE on it.
--
-- UNCHANGED, deliberately:
--   * public read on institutions / events / news
--   * anon insert on contacts / connect_signups
--   * media public read
--   * pg_trgm stays in public (moving it risks the trigram indexes; see
--     docs/SECURITY.md)
--
-- REMOVED, not replaced: "public upsert signups" (anon UPDATE using (true) on
-- connect_signups). Nothing upserts into that table — /api/subscribe does a
-- plain insert and maps 23505 to "already registered" — so it granted anon an
-- UPDATE path for no caller.

begin;

-- ---------------------------------------------------------------------------
-- 1. Drop the old permissive policies.
--
-- Names taken from pg_policies on the live database on 2026-10-07, not from
-- the migration files. Every one granted on auth.role() = 'authenticated'
-- (or, for the signups UPDATE, on true).
-- ---------------------------------------------------------------------------
drop policy if exists "admin write institutions"   on public.institutions;    -- ALL
drop policy if exists "admin write events"         on public.events;          -- ALL
drop policy if exists "admin write news"           on public.news;            -- ALL
drop policy if exists "admin read contacts"        on public.contacts;        -- SELECT
drop policy if exists "admin update contacts"      on public.contacts;        -- UPDATE
drop policy if exists "admin read signups"         on public.connect_signups; -- SELECT
drop policy if exists "public upsert signups"      on public.connect_signups; -- UPDATE, anon
drop policy if exists "media authenticated insert" on storage.objects;        -- INSERT
drop policy if exists "media authenticated update" on storage.objects;        -- UPDATE
drop policy if exists "media authenticated delete" on storage.objects;        -- DELETE

-- Re-run safety only: the names this file creates below, so applying it twice
-- does not fail on "policy already exists".
drop policy if exists "admin insert institutions" on public.institutions;
drop policy if exists "admin update institutions" on public.institutions;
drop policy if exists "admin delete institutions" on public.institutions;
drop policy if exists "admin insert events"       on public.events;
drop policy if exists "admin update events"       on public.events;
drop policy if exists "admin delete events"       on public.events;
drop policy if exists "admin insert news"         on public.news;
drop policy if exists "admin update news"         on public.news;
drop policy if exists "admin delete news"         on public.news;
drop policy if exists "media admin or own avatar insert" on storage.objects;
drop policy if exists "media admin or own avatar update" on storage.objects;
drop policy if exists "media admin or own avatar delete" on storage.objects;
-- ("admin read contacts", "admin update contacts" and "admin read signups" are
-- recreated under their old names, so the drops above already cover them.)

-- ---------------------------------------------------------------------------
-- 2. is_admin()
--
-- SECURITY DEFINER because public.admins has RLS on and no policies — the
-- caller cannot read it directly, and must not be able to. search_path is
-- empty, so every name inside is schema-qualified.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid()
  );
$$;

-- Supabase grants EXECUTE to anon directly via default privileges, so revoking
-- from PUBLIC alone is not enough — revoke from anon by name.
revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. institutions / events / news: writes are admin-only
-- ---------------------------------------------------------------------------
create policy "admin insert institutions" on public.institutions
  for insert to authenticated with check (public.is_admin());
create policy "admin update institutions" on public.institutions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete institutions" on public.institutions
  for delete to authenticated using (public.is_admin());

create policy "admin insert events" on public.events
  for insert to authenticated with check (public.is_admin());
create policy "admin update events" on public.events
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete events" on public.events
  for delete to authenticated using (public.is_admin());

create policy "admin insert news" on public.news
  for insert to authenticated with check (public.is_admin());
create policy "admin update news" on public.news
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete news" on public.news
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. contacts: admin read + mark-as-read. connect_signups: admin read.
-- ---------------------------------------------------------------------------
create policy "admin read contacts" on public.contacts
  for select to authenticated using (public.is_admin());
create policy "admin update contacts" on public.contacts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admin read signups" on public.connect_signups
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. Storage: media bucket
--
-- Admins may write anywhere in the bucket (event and news covers).
-- Members may write only inside avatars/<their own auth.uid()>/ — ImageUpload
-- builds avatar paths as avatars/<uid>/<timestamp>-<slug>.
-- storage.foldername('avatars/<uid>/x.jpg') = {avatars,<uid>}.
-- Bucket size and MIME limits (migration-images.sql) still apply to everyone.
-- ---------------------------------------------------------------------------
create policy "media admin or own avatar insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media' and (
      public.is_admin()
      or (
        (storage.foldername(name))[1] = 'avatars'
        and (storage.foldername(name))[2] = (select auth.uid())::text
      )
    )
  );

create policy "media admin or own avatar update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'media' and (
      public.is_admin()
      or (
        (storage.foldername(name))[1] = 'avatars'
        and (storage.foldername(name))[2] = (select auth.uid())::text
      )
    )
  )
  with check (
    bucket_id = 'media' and (
      public.is_admin()
      or (
        (storage.foldername(name))[1] = 'avatars'
        and (storage.foldername(name))[2] = (select auth.uid())::text
      )
    )
  );

create policy "media admin or own avatar delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media' and (
      public.is_admin()
      or (
        (storage.foldername(name))[1] = 'avatars'
        and (storage.foldername(name))[2] = (select auth.uid())::text
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 6. Advisor warnings
-- ---------------------------------------------------------------------------

-- function_search_path_mutable: set_updated_at only calls now(), which lives
-- in pg_catalog and resolves with an empty search_path.
alter function public.set_updated_at() set search_path = '';

-- anon_security_definer_function_executable: every policy that calls
-- is_approved_member() is TO authenticated, so anon never needs it.
revoke all on function public.is_approved_member() from anon;

commit;

-- ---------------------------------------------------------------------------
-- Verify (run after applying). Lists every policy on the six tables; the only
-- INSERT / UPDATE / DELETE policies should be the is_admin() and own-avatar
-- ones above, plus anon INSERT on contacts and connect_signups.
--
--   select schemaname, tablename, policyname, cmd, roles, qual, with_check
--   from pg_policies
--   where (schemaname = 'public'
--          and tablename in ('institutions','events','news','contacts','connect_signups'))
--      or (schemaname = 'storage' and tablename = 'objects')
--   order by schemaname, tablename, cmd, policyname;
-- ---------------------------------------------------------------------------
