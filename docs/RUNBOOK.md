# Runbook

Operational procedures. One person runs this system; assume you are tired and
reading this at a bad time.

## First-time setup (new Supabase project)

Only needed when standing the backend up from scratch. The live project
(`zxffaohxxzbthspeelpj`) is already past this.

1. **Create the project** at supabase.com. Note the region — the live one is
   `ap-south-1`.
2. **Run the SQL files in order**, one at a time, in SQL Editor → new query.
   Order matters: each depends on the last.

   | # | File | Adds |
   |---|---|---|
   | 1 | `supabase/schema.sql` | 5 core tables + public-read RLS |
   | 2 | `supabase/seed.sql` | 16 institutions, events, news |
   | 3 | `supabase/migration-admin.sql` | `is_read`, `updated_at` triggers, admin RLS |
   | 4 | `supabase/migration-images.sql` | `events.image_url`, `media` bucket + policies |
   | 5 | `supabase/migration-connect.sql` | `profiles`, `admins`, directory view — **read the hazard below first** |

3. **Create the admin user.** Authentication → Users → Add user → Create new
   user. Tick *Auto Confirm User*. There is no public admin signup by design.
4. **Set the environment variables** (next section), then deploy.
5. **Enable Google auth** (Connect only): Authentication → Providers → Google,
   with `https://<your-domain>/connect/callback` as an authorised redirect.
   Confirm email confirmation is enabled — the signup flow assumes it.

## Environment variables (Vercel)

| Name | Type | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Config | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Config | Same page → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Same page → service_role |
| `REVALIDATION_SECRET` | Secret | Any random string |
| `NEXT_PUBLIC_SITE_URL` | Config | Only after a custom domain |
| `RESEND_API_KEY` | Secret | Optional; email skipped silently if unset |

`NEXT_PUBLIC_*` must be type **Config**. Vercel warns that public prefixes are
browser-visible — that is correct and intended. The anon key is designed to be
public; RLS is the control.

Set every var for **Production and Preview**, or preview builds fall back to
seed data and look wrong.

The Vercel–Supabase integration also creates `POSTGRES_*` and `SUPABASE_*` vars.
The app does not read them. Harmless; leave them.

## Applying a migration

1. Read the SQL end to end. Understand what it drops.
2. Supabase → SQL Editor → new query → paste → Run.
3. A "destructive operation" warning on seed files is expected — they
   delete-then-insert their own rows by id prefix.
4. Verify the result (queries below).
5. Only then deploy code that depends on it.

**Agents write migrations; the human runs them.** No exceptions.

### `migration-connect.sql` — read first

Bootstraps `admins` from all existing `auth.users`. Correct **only** while those
are all real administrators.

> Apply before any member signs up. A member who registers first is
> bootstrapped as an admin.

Deploy code and migration together — the new code needs the `admins` table, so
admin login breaks until it exists.

Immediately after:

```sql
select a.user_id, u.email, a.note
from public.admins a join auth.users u on u.id = a.user_id;
```

Anyone in that list who should not be an admin: delete the row now.

## Deploying

Push to `main` — Vercel builds automatically. To force a clean build:
Deployments → latest → ⋯ → Redeploy → tick *Clear build cache*.

After changing env vars you **must** redeploy. They are baked in at build time.

## Verification queries

Row counts:
```sql
select 'institutions' t, count(*) from public.institutions
union all select 'events', count(*) from public.events
union all select 'news', count(*) from public.news
union all select 'contacts', count(*) from public.contacts
union all select 'connect_signups', count(*) from public.connect_signups;
```
Expect 16 institutions.

Policies on a table:
```sql
select policyname, cmd, roles::text, qual, with_check
from pg_policies where tablename = 'profiles';
```

Pending members:
```sql
select full_name, role, status, created_at
from public.profiles where status = 'pending' order by created_at;
```

## Incidents

**Site shows stale or wrong content.** ISR cache. Trigger `/api/revalidate` or
redeploy. If content is *missing*, check Vercel logs for the seed-fallback
warning — that means Supabase is unreachable.

**`localhost:3000` in canonical / OG tags.** `SITE_URL` resolution. It hardcodes
the production fallback and ignores localhost values, so this means an old build
is being served. Redeploy with cache cleared.

**Admin login fails after the Connect migration.** Expected if the `admins` table
is missing or the account has no row. Check with the query above.

**Form submits return 429.** Rate limiter. It is in-memory and per-instance, so
it resets on redeploy. If a real user is stuck, redeploying clears it — that is
a symptom of the limiter being inadequate, not a fix. See ROADMAP → Scale
readiness.

**Form submits return 422.** Validation. Per-field errors render inline; the
Supabase error (`code`, `message`, `details`, `hint`) is logged to Vercel.

**Image upload fails.** Check the `media` bucket exists and is public, and that
the storage policies are present. Uploads need an authenticated session.

**Map tiles show "API KEY REQUIRED".** Deprecated CARTO endpoint. Must be
`{s}.basemaps.cartocdn.com`.

**Admin pages show "DB not configured".** `SUPABASE_SERVICE_ROLE_KEY` is missing
or wrong in Vercel. Fix it, then redeploy — env vars are baked in at build time.

**Redirect loop on `/admin/login`.** Middleware cannot verify the token. Check
both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then confirm the
account has a row in `public.admins`.

**Approval emails not arriving.** `RESEND_API_KEY` is optional and skipped
silently when unset. If it is set, the sending domain must be verified in Resend
with SPF and DKIM, or mail lands in spam. The `from` address is
`noreply@crescentglobal.org`.

## Rotating the service-role key

Supabase → Settings → API → roll the key, update `SUPABASE_SERVICE_ROLE_KEY` in
Vercel, redeploy. Admin writes fail between the roll and the redeploy — do it
when nobody is editing.

## Before handing anything to the client

- [ ] Delete test events, contacts and signups
- [ ] Confirm admin credentials work and the client knows how to reset them
- [ ] Walk them through `/admin` once, live
- [ ] Confirm someone owns the member approval queue
