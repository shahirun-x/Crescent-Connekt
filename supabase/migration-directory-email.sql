-- ============================================================================
-- migration-directory-email.sql
-- Make directory_profiles readable with a MEMBER's own session.
-- ============================================================================
--
-- DO NOT RUN AUTOMATICALLY. Review, then apply by hand in the Supabase SQL
-- editor on wrggjorrzqyfxdwvfeab (CLAUDE.md hard rule 1).
--
-- WHY
--
-- directory_profiles is `security_invoker = true` and joined auth.users to read
-- each member's email. The `authenticated` role has no SELECT on auth.users,
-- so ANY query on the view made with a member's own JWT failed with:
--
--     permission denied for table users
--
-- That is why every existing reader (the directory API, profile pages) used
-- the service role — which bypasses RLS entirely. The member home must query
-- other members with the member's own session so RLS, not application code,
-- decides who is visible. This makes that possible without widening anything.
--
-- WHAT CHANGES
--
-- 1. The view stops joining auth.users. The email column comes instead from
--    public.directory_email(id), a SECURITY DEFINER function that is the ONLY
--    path from a member session to another member's email. It repeats every
--    check itself, so calling it directly over RPC exposes nothing the view
--    would not:
--      - the target has show_email = true, AND
--      - the caller IS the target, OR the target is approved and the caller is
--        an approved member (the exact rule of the profiles SELECT policy), OR
--      - the caller is the service role (keeps today's directory API and admin
--        tooling returning consented emails exactly as before).
--
-- 2. Grants on the view are reset. Supabase's default privileges had given
--    anon AND authenticated every privilege on it (arwdDxtm — including
--    INSERT, UPDATE, DELETE, TRUNCATE). RLS on profiles meant anon read zero
--    rows, but that should never be the only line. After this migration:
--    SELECT to authenticated and service_role, nothing to anon or PUBLIC.
--
-- Unchanged: same columns, names, types and order; security_invoker stays on,
-- so row visibility is decided by the caller's RLS on profiles (a member never
-- sees a pending, rejected or suspended profile other than their own); phone
-- masking is untouched.
--
-- IDEMPOTENT: safe to run twice.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. The only route from a member session to another member's email.
--
-- search_path is EMPTY, so every name below is schema-qualified. A SECURITY
-- DEFINER function with a writable search_path can be hijacked by a same-named
-- object planted earlier on the path; an empty path removes that possibility.
-- ---------------------------------------------------------------------------
create or replace function public.directory_email(p_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.email::text
  from auth.users as u
  join public.profiles as p on p.id = u.id
  where u.id = p_id
    and p.show_email
    and (
      p_id = auth.uid()
      or (p.status = 'approved' and public.is_approved_member())
      or auth.role() = 'service_role'
    );
$$;

-- Supabase grants EXECUTE on new public functions to anon by default; revoke
-- by name, not just from PUBLIC.
revoke all on function public.directory_email(uuid) from public;
revoke all on function public.directory_email(uuid) from anon;
grant execute on function public.directory_email(uuid) to authenticated;
grant execute on function public.directory_email(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 2. The view. Same column list, names and types as before, so CREATE OR
--    REPLACE is legal and no caller has to change. Only the source of
--    `email` moves.
-- ---------------------------------------------------------------------------
create or replace view public.directory_profiles
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
  case when p.show_email then public.directory_email(p.id) else null end as email,
  case when p.show_phone then p.phone else null end as phone,
  p.created_at
from public.profiles as p
left join public.institutions as i on i.id = p.institution_id;

-- Belt and braces: assert the option explicitly. Without it the view runs as
-- its owner, bypasses RLS on profiles, and every member would see pending,
-- rejected and suspended profiles.
alter view public.directory_profiles set (security_invoker = true);

-- ---------------------------------------------------------------------------
-- 3. Grants on the view: reset, then SELECT only, to two roles only.
-- ---------------------------------------------------------------------------
revoke all on public.directory_profiles from public;
revoke all on public.directory_profiles from anon;
revoke all on public.directory_profiles from authenticated;
grant select on public.directory_profiles to authenticated;
grant select on public.directory_profiles to service_role;

commit;

-- ============================================================================
-- VERIFY after applying. All read-only; checks 4 and 5 roll back.
--
-- 1. security_invoker is on, and the view no longer references auth.users:
--
--   select reloptions,
--          pg_get_viewdef('public.directory_profiles'::regclass, true) ilike '%auth.users%' as still_joins_auth_users
--   from pg_class where oid = 'public.directory_profiles'::regclass;
--   -- expect: {security_invoker=true}, false
--
-- 2. View grants — expect exactly: postgres (owner), authenticated=r, service_role=r.
--    No anon entry at all.
--
--   select relacl from pg_class where oid = 'public.directory_profiles'::regclass;
--
-- 3. Function privileges and settings:
--
--   select has_function_privilege('anon',          'public.directory_email(uuid)', 'execute') as anon,           -- false
--          has_function_privilege('authenticated', 'public.directory_email(uuid)', 'execute') as authenticated,  -- true
--          has_function_privilege('service_role',  'public.directory_email(uuid)', 'execute') as service_role,   -- true
--          p.prosecdef as security_definer,                                                                       -- true
--          p.provolatile = 's' as stable,                                                                         -- true
--          p.proconfig as config                                                                                  -- {"search_path=\"\""}
--   from pg_proc p where p.oid = 'public.directory_email(uuid)'::regprocedure;
--
-- 4. AS AN APPROVED MEMBER'S SESSION: the view works (no "permission denied
--    for table users") and returns no non-approved profile except the
--    caller's own. Replace <APPROVED_MEMBER_UUID> with a real approved id.
--
--   begin;
--   set local role authenticated;
--   select set_config('request.jwt.claims',
--     json_build_object('sub', '<APPROVED_MEMBER_UUID>', 'role', 'authenticated')::text, true);
--   select count(*)                                                   as rows_visible,
--          count(*) filter (where status <> 'approved'
--                           and id <> '<APPROVED_MEMBER_UUID>')       as leaked_non_approved   -- expect 0
--   from public.directory_profiles;
--   rollback;
--
-- 5. AS A PENDING MEMBER'S SESSION: only their own row is visible. Replace
--    <PENDING_MEMBER_UUID> with a real pending id (skip if none exist).
--
--   begin;
--   set local role authenticated;
--   select set_config('request.jwt.claims',
--     json_build_object('sub', '<PENDING_MEMBER_UUID>', 'role', 'authenticated')::text, true);
--   select count(*) as rows_visible,                                  -- expect 1
--          count(*) filter (where id <> '<PENDING_MEMBER_UUID>') as others   -- expect 0
--   from public.directory_profiles;
--   rollback;
--
-- 6. Service-role readers unaffected — consented emails still present.
--    Run WITH the service role's claims: the SQL editor runs as postgres with
--    no JWT, so auth.role() would be null and every email would read as
--    missing — a false alarm, not a regression.
--
--   begin;
--   set local role service_role;
--   select set_config('request.jwt.claims',
--     json_build_object('role', 'service_role')::text, true);
--   select count(*) filter (where show_email and email is null) as consented_but_missing   -- expect 0
--   from public.directory_profiles;
--   rollback;
--
-- ROLLBACK: re-run the directory_profiles block from migration-connect.sql
-- (the auth.users join), re-apply step 3's grants above, then:
--   drop function if exists public.directory_email(uuid);
-- ============================================================================
