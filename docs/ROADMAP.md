# Roadmap

**Status date:** 6 September 2026
**Update this file in the same commit as the work it describes.**

---

## Now — Connect Phase 1 (built, not live)

Commit `17ae7a7`. Migration written, **not applied**.

- [x] `profiles`, `admins`, `directory_profiles` view, RLS, status trigger
- [x] Signup, email verification, 3-step profile setup, pending page
- [x] Member login with status-based routing
- [x] Member directory with search and filters
- [x] Member detail + own-profile edit
- [x] Admin `/admin/members` with approve / reject / suspend
- [x] Admin authorisation moved to explicit `admins` grant
- [ ] **Apply `supabase/migration-connect.sql`** — read the bootstrap hazard in
      `docs/SECURITY.md` first
- [ ] Enable Google provider in Supabase; redirect `…/connect/callback`
- [ ] Confirm email verification is on
- [ ] Walk the signed-in flows end to end — setup wizard, directory filtering,
      approve/reject. Only unauthenticated paths were verifiable at build time.

**Decisions locked with the client:** admin approval required; contact details
hidden unless the member opts in; directory is members-only, never public.
**Still open:** who at CGOM owns the approval queue. Without a named owner,
applications pile up and the network stalls.

---

## Next — before public launch

- [ ] **Mobile audit.** Real devices, not devtools. Most of this audience is on
      phones. Hero sizing, nav, calendar swipe, map touch, directory grid.
- [ ] **Lighthouse** against `npm run build && npm start`, target 90+ across all
      four. Dev-server numbers are meaningless.
- [ ] **Real campus photography.** The hero is an Unsplash placeholder. This is
      the most visible remaining gap.
- [ ] **Content sign-off** — institution descriptions, seeded events and news
      are representative, not real. Client must replace or approve.
- [ ] Custom domain, then set `NEXT_PUBLIC_SITE_URL`.
- [ ] Custom 404 / 500 matching the site.
- [ ] Loading skeletons for calendar, map, directory.
- [ ] Confirm with client whether CIIC stays (not on the official directory card).

---

## Scale readiness — required before real traffic

Current tiers will not carry a live institutional network.

- [ ] **Vercel Hobby → Pro.** Hobby prohibits commercial use. This is a client
      project. Non-optional before public launch.
- [ ] **Supabase Free → Pro.** Free pauses when idle, caps connections, and has
      no point-in-time recovery. An alumni directory cannot lose data.
- [ ] **Replace the in-memory rate limiter.** `lib/rate-limit.ts` is
      per-instance and does not survive serverless. Move to Upstash Redis or a
      Postgres-backed counter.
- [ ] **Backups.** Verify Supabase backup cadence and actually test a restore.
      An untested backup is not a backup.
- [ ] **Error monitoring.** Sentry or equivalent. Right now failures are only
      visible in Vercel logs if someone looks.
- [ ] **Index review.** Directory filters on role, institution, batch, city will
      need composite indexes past a few hundred profiles.
- [ ] **Directory pagination correctness** under thousands of rows — offset
      pagination degrades; consider keyset.
- [ ] **Email deliverability.** Resend needs a verified sending domain, SPF and
      DKIM, or approval mails land in spam.
- [ ] **Enforce upload limits server-side.** `ImageUpload` validates type and
      size in the browser only; the storage policy accepts any authenticated
      INSERT. Set `allowed_mime_types` and `file_size_limit` on the `media`
      bucket. See `docs/SECURITY.md` → *Known gap*.

---

## Phase 2 — Connection features

- [ ] Alumni chapters by city/country, with chapter leads
- [ ] Mentorship: alumni opt in, students request, admin or lead brokers
- [ ] Opportunity board — alumni post roles for Crescent graduates
- [ ] Institution-scoped views: each institution sees its own members and events

## Phase 3 — Communication

- [ ] Direct messaging (needs a blocking/reporting design before it ships)
- [ ] Notifications — event reminders, chapter updates, connection requests
- [ ] Chapter discussion threads

> Phase 3 introduces user-to-user contact. That needs moderation tooling and a
> reporting flow designed **before** the feature, not after.

## Later

- Resource mobilisation and donation flows — needs a payments and compliance
  review of its own
- Tamil and Arabic alongside English
- Institution dashboards
- Public API so institutions can push their own events
- PWA / mobile app

---

## Done

| Milestone | Commit |
|---|---|
| Full build — 7 pages, 16 institutions | `2612541` |
| SEO / production URL hardening | `ae0229e` → `77f23bb` |
| Interactive calendar, month + week | `b46fd62` → `f5d8a2f` |
| Institution map, hero, visual warmth | `7b13252` → `621589d` |
| Institution data corrected from official card | `d58d3c7` |
| Founding year 1968 + 1971 Vandalur move | `1b9a60b` |
| CGOM vision, mission, strategic streams | `ec07eb3` → `213ece2` |
| Supabase admin dashboard + form backends | `1fe7484` |
| Event schema fix, institution dropdown, uploads | `6d7afcd` |
| Unified news+events stream, contact form fix | `d74d343` |
| Connect Phase 1 | `17ae7a7` |
