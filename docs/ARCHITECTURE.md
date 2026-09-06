# Architecture

## Shape of the system

```
Browser
  │
  ├─ Public pages ───────── Next.js SSG/ISR ──┐
  ├─ /admin/*  ── middleware guard ───────────┤
  └─ /connect/* ─ middleware guard ───────────┤
                                              │
                                       lib/data.ts
                                              │
                            ┌─────────────────┴──────────────┐
                            │                                │
                    Supabase (primary)              lib/seed.ts (fallback)
                    Postgres · Auth · Storage
```

`lib/data.ts` always tries Supabase and falls back to seed data with a logged
warning. **The site renders even with zero configuration.** This is deliberate:
a database outage degrades content freshness, not availability.

## Rendering strategy

| Route | Mode | Why |
|---|---|---|
| `/` | ISR 1h | Events strip needs some freshness |
| `/institutions` | ISR 24h | Structural data, rarely changes |
| `/calendar` | ISR 10m | Admin edits should appear quickly |
| `/news` | ISR 10m | Same |
| `/about` | ISR 24h | Strategy content, near-static |
| `/contact` | Static | Form posts to an API route |
| `/connect` | Dynamic | Session-aware CTAs since Connect Phase 1 |
| `/admin/*`, `/connect/*` (gated) | Dynamic | Per-user, auth-gated |
| `/api/*` | Dynamic | Always |

Admin write routes call `revalidatePath()` **in process**, immediately after a
successful write — no HTTP hop, no secret. Each route busts only the pages it
affects:

| Route | Revalidates |
|---|---|
| `/api/admin/events` | `/`, `/calendar` |
| `/api/admin/news` | `/`, `/news` |
| `/api/admin/institutions` | `/`, `/institutions` |

`/api/revalidate` is a **separate** endpoint for external callers, guarded by
`REVALIDATION_SECRET`. Nothing in the admin UI uses it. ISR windows are the
fallback, not the mechanism.

## Data model

### Public content
- `institutions` — 16 rows. Structural; edit-only in admin, never created there.
  Carries `parent_org` (Seethakathi Trust | All India Islamic Foundation) and
  `latitude`/`longitude` for the map.
- `events` — `institution_id` is **nullable** (network-wide events). Has
  `image_url`.
- `news` — same shape, `published_at` instead of dates.

### Forms
- `contacts` — anon INSERT only. `is_read` for admin triage.
- `connect_signups` — pre-launch early-access list. Unique on email. Retained
  after Connect launches; these are real leads.

### Members (Phase 1, migration written not yet applied)
- `profiles` — 1:1 with `auth.users`. `status` ∈ pending | approved | rejected |
  suspended. Consent flags `show_email` / `show_phone`.
- `directory_profiles` — a **view** that masks email/phone via `CASE` on the
  consent flags. The directory reads the view, never the table.
- `admins` — explicit admin grant. See `docs/SECURITY.md`.

### Storage
Bucket `media`, public read, authenticated write. Paths are
`{folder}/{timestamp}-{slug}` — `events/`, `news/`, `avatars/`.

## Two auth surfaces

They share one Supabase Auth project and share nothing else.

| | Admin | Member |
|---|---|---|
| Entry | `/admin/login` | `/connect/login` |
| Cookie | `sb-access-token` | `cg-member-token` (httpOnly) |
| Authorisation | row in `public.admins` | `profiles.status = 'approved'` |
| Guard | `middleware.ts` + `getAdminUser()` | `middleware.ts` + status check |

**Do not unify these.** A member holding a valid token must never reach admin.

## Key components

- `CalendarExplorer` — the single client parent holding filter, time-range,
  view and selected-day state. `Calendar` and the event list are children. They
  cannot be siblings under a server component; they must share state.
- `InstitutionMap` — Leaflet, dynamically imported with `ssr: false`. Custom
  proximity clustering (~13 km), no cluster plugin. Scroll-zoom disabled by
  default; Ctrl/⌘ to zoom. This is a deliberate anti-scroll-hijack measure.
- `ImageUpload` — shared by event, news and avatar forms. Validates type and
  5 MB, uploads to `media`, returns a public URL.
- `Pipeline` — the School-to-Start-up flow. Horizontal desktop, vertical mobile.
  Used on `/` and `/about`.

## Performance posture

- Shared JS ~103 kB; homepage ~156 kB First Load. 45 routes at last build.
- Leaflet (~150 kB) is a lazy async chunk, never in the critical path.
- No web fonts. Inline SVG logo and favicon.
- Images through `next/image` with `remotePatterns` for `images.unsplash.com`
  and the Supabase storage host.

## Known scaling ceilings

Current tiers are Vercel **Hobby** and Supabase **Free**. These are fine for
launch and will not survive real traffic. Hobby forbids commercial use, and the
free database pauses when idle and caps connections. The in-memory rate limiter
in `lib/rate-limit.ts` is **per-instance** — it does not hold across serverless
invocations and is not a real limiter under load.

See `docs/ROADMAP.md` → *Scale readiness* before any launch that expects volume.
