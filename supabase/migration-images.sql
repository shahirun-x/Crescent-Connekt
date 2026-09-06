-- Crescent Global — image support for events and news
-- Run AFTER schema.sql and migration-admin.sql in the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------

-- events: cover image (news already has image_url from schema.sql, but we add
-- it idempotently here in case an older schema is in place)
alter table public.events add column if not exists image_url text;
alter table public.news   add column if not exists image_url text;

-- ---------------------------------------------------------------------------
-- Storage bucket: "media"
-- Public read, authenticated write.
--
-- file_size_limit and allowed_mime_types are enforced by Supabase Storage
-- server-side, on the bucket itself. This is the real boundary: the checks in
-- components/admin/ImageUpload.tsx are for fast feedback only and are
-- bypassable, since the browser uploads straight to Storage. Do not rely on
-- the client alone — keep these bucket settings in place.
--
-- 5242880 bytes = 5 MB, matching MAX_BYTES in ImageUpload.tsx.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Drop existing policies so this migration stays re-runnable
drop policy if exists "media public read"          on storage.objects;
drop policy if exists "media authenticated insert" on storage.objects;
drop policy if exists "media authenticated update" on storage.objects;
drop policy if exists "media authenticated delete" on storage.objects;

-- Anyone can read objects in the media bucket
create policy "media public read" on storage.objects
  for select
  using (bucket_id = 'media');

-- Only signed-in admins can upload
create policy "media authenticated insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media');

-- Only signed-in admins can replace
create policy "media authenticated update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

-- Only signed-in admins can remove
create policy "media authenticated delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media');
