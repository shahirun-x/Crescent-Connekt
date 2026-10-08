# Security

Read this in full before changing anything touching auth, RLS, or `/admin`.
Several rules here exist because a specific vulnerability was found and closed.
Reversing one silently re-opens it.

## Threat model

The valuable assets, in order:

1. **Member contact details.** An alumni network's email list is exactly what a
   spammer wants. Consent flags exist to protect this.
2. **Admin write access.** Content defacement on an institutional site.
3. **Form tables.** Spam volume, not data theft.

Public content (institutions, events, news) is meant to be world-readable. It is
not an asset to defend.

## Admin authorisation — explicit grant

**The rule: a valid Supabase session is not admin. A row in `public.admins` is.**

Originally `/admin` only checked that the token belonged to a real `auth.users`
row. That was safe *only* because every auth user was an administrator.

Public member signup breaks that assumption completely. Every member gets a
valid token; copying it into the `sb-access-token` cookie would have granted
full admin. This is a privilege-escalation hole, and it is why the `admins`
table exists.

Checked in **both** `middleware.ts` and `getAdminUser()`. Two layers, on
purpose — middleware can be bypassed by direct API calls.

### Bootstrap hazard

`migration-connect.sql` seeds `admins` from every existing `auth.users` row:

```sql
insert into public.admins (user_id, note)
select id, 'bootstrapped by migration-connect.sql' from auth.users
on conflict (user_id) do nothing;
```

This is correct **only while the sole auth users are real administrators.**

> **Apply the migration before any member signs up.** If a member registers
> first, they are bootstrapped as an administrator.

Deploy code and migration together: the new code requires the `admins` table, so
admin login fails until it exists. Verify the table contents immediately after
applying — see `docs/RUNBOOK.md`.

## RLS design

### Privileged policies check `is_admin()`, never authentication

The same rule applies inside the database. Any policy granting a write, or a
read of private data, must check `public.is_admin()` — never
`auth.role() = 'authenticated'` or `auth.uid() is not null`. A member session is
a valid session. `migration-admin.sql` got this wrong once signup opened, and
`migration-admin-rls.sql` replaced every such policy (DECISIONS #31).
`e2e/rls.spec.ts` tests it straight against Supabase, with a member's own
session.

Scope admin policies `to authenticated` and give each command its own policy
rather than `for all`. Then anon reads and inserts never evaluate `is_admin()`,
and anon can be refused `EXECUTE` on it.

### `pg_trgm` stays in `public`

The advisor flags `extension_in_public` for `pg_trgm`. That's accepted: the
directory's trigram indexes (`migration-indexes.sql`) depend on its operator
classes, and moving the extension risks breaking them for a lint warning.
Revisit only with a tested plan to rebuild those indexes.

### Recursion trap

"Approved members can see approved profiles" must query `profiles` from inside a
`profiles` policy — infinite recursion. `is_approved_member()` is
`SECURITY DEFINER` to break the cycle. **Do not inline it back into the policy.**

### RLS is row-level, not column-level

An UPDATE policy cannot stop a member setting `status = 'approved'` on their own
row — it is their row. A **trigger** enforces that status transitions only come
from the service role (`auth.uid() IS NULL`).

Never move that check into a policy. It will not work.

### Column masking, not UI hiding

`directory_profiles` masks `email` and `phone` with `CASE` on the consent flags,
for **every** caller including the service role. A stray `select('*')` cannot
leak contact details.

Two layers: masking at the view, row access enforced in the routes. Read the
view, never the table, for anything member-facing.

### Member pages read as the member

`/connect/home` reads every row through `getMemberDb()` (`lib/member-db.ts`):
the publishable key plus the member's own access token, so RLS decides what
comes back. It imports no service-role client. New member-facing pages that
show other members should follow it, not the older directory API and profile
page, which still read with the service role and rely on an explicit
`.eq("status", "approved")`. See DECISIONS #32.

### The `.select()` trap on anonymous inserts

Anon has INSERT but no SELECT on `contacts` and `connect_signups`. Adding
`.select()` sends `return=representation`, which needs SELECT, and fails with
RLS `42501`. A plain insert returns 201.

There is a comment in the route explaining this. **Leave it.** It exists so a
future agent does not "helpfully" add `.select()` back.

## Order of operations in API routes

**Validate → rate-limit → act.**

Getting this backwards was a real bug: `checkRateLimit` ran first, malformed
submissions burned quota, and the caller was locked out at 429 before a single
valid request reached the database. Only well-formed requests count against a
limit.

## Non-negotiables

- Status changes only via the admin service-role route. Never trust a
  client-supplied `status`.
- Validate `role` against the allowlist server-side.
- Service-role key is server-only. It bypasses RLS entirely.
- Protected API routes return **401**, not an empty array. An empty array is
  indistinguishable from "no results" and hides broken auth.
- Sanitise free-text (`bio`, `headline`, `message`) before storage.
- Uploads: image types only, 5 MB cap, enforced at the storage bucket. See below.

## Upload limits — enforced at the bucket

The browser uploads **directly** to Supabase Storage; there is no server-side
upload route. So the checks in `components/admin/ImageUpload.tsx` are for fast
feedback only — anyone with a session can call the Storage API directly and
skip them.

The real boundary is the bucket itself. `media` carries:

| Setting | Value |
|---|---|
| `file_size_limit` | `5242880` (5 MB) |
| `allowed_mime_types` | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |

Supabase enforces both server-side and rejects a non-conforming upload
regardless of what the client sends. This is set in
`supabase/migration-images.sql`, so a fresh environment gets it on first run,
and the `on conflict` clause re-applies it if the bucket already exists.

**Do not remove these settings.** The storage RLS policies decide *where* a
caller may write, not *what*: admins anywhere in `media`, members only inside
`avatars/<their own uid>/` (`supabase/migration-admin-rls.sql`). They do not
constrain type or size. Without the bucket settings, a member could put a 2 GB
executable in their own avatar folder. Tightening
the client is not a substitute; the client is the part an attacker controls.

> The bucket permits `image/gif`, which `ImageUpload` does not offer. The
> bucket is deliberately the wider boundary — widen the client to match if GIF
> support is ever wanted, rather than narrowing the bucket to the client.

## Deliberately accepted

- **Anon key is public.** It is designed to be. RLS is the control. Set it as
  Vercel type *Config*, not *Secret* — the `NEXT_PUBLIC_` prefix is required for
  the browser client to work at all.
- **Admin approval gate.** Chosen over open signup: an alumni directory where
  anyone can self-register and immediately browse hundreds of members is a
  privacy problem. Costs one admin screen, protects the whole network.
- **Rate limiter is in-memory.** Adequate for launch, not for scale. Flagged in
  `docs/ROADMAP.md`.

## If you find a vulnerability

Fix it, then add it here with the reasoning. The next agent needs to know why
the guard exists, or they will remove it.
