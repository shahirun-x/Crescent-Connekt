# CLAUDE.md

Read this first, every session. It is the shared memory for this repo.

## What this is

**Crescent Global** — a portal for the Crescent Global Outreach Mission (CGOM).
It **supplements, never replaces** the websites of ~16 institutions under two
parent trusts. It is a glossary, a guide, and a coordination layer that unifies
and channels their collective efforts for the betterment of the alma mater.

Live: https://crescent-global-calender.vercel.app
Repo: https://github.com/shahirun-x/Crescent-Connekt
Supabase project ref: `zxffaohxxzbthspeelpj` (ap-south-1)

The repo was renamed to **Crescent-Connekt** — the generic name, which the
domain will follow. The Vercel URL still carries the old project slug and is
**correct as-is** until a custom domain is bought. Do not "fix" it to match the
repo name: it is the live deployment, and `PRODUCTION_URL` in `lib/site.ts`
feeds canonical and OG tags. When the domain lands, set `NEXT_PUBLIC_SITE_URL`
rather than editing that constant.

Built by one person (Shahirun) directing coding agents. There is no second
engineer to ask. Write code and docs accordingly.

## Read before you work

| Doc | Read it when |
|---|---|
| `docs/ARCHITECTURE.md` | Touching data flow, routing, or rendering strategy |
| `docs/SECURITY.md` | **Any** auth, RLS, or admin change — non-negotiable |
| `docs/ROADMAP.md` | Deciding what to build next |
| `docs/DECISIONS.md` | About to reverse something that looks odd |
| `docs/RUNBOOK.md` | Deploying, migrating, or something is broken |

## Hard rules

1. **Never run migrations yourself.** Write the SQL to `supabase/`, then stop and
   say so. The human applies it. Migrations are reviewed before they run.
2. **Never weaken RLS to make a feature work.** If a policy blocks you, the
   policy is probably right and the query is wrong. See `docs/SECURITY.md`.
3. **Admin and member auth are separate surfaces.** Different cookies, different
   guards. Do not merge them. Do not reuse one's helpers in the other.
4. **Never add `.select()` to an anonymous insert.** Anon has INSERT but not
   SELECT on form tables; `return=representation` fails with RLS `42501`.
5. **Validate before rate-limiting.** Malformed requests must not consume a
   caller's quota. This was a real bug (see `docs/DECISIONS.md` #12).
6. **Institution data is client-supplied truth.** Names, URLs, addresses and
   parent orgs come from an official directory card. Do not "correct" them from
   web search or memory.
7. **No new dependencies without a reason in the commit message.** Current stack
   is deliberately small.
8. **Secrets never enter the repo.** `.env.local` is gitignored. Check staged
   diffs before pushing.

## Stack

Next.js 15.5 App Router · TypeScript · Tailwind v4 (`@theme`, no config file) ·
Supabase (Postgres + Auth + Storage) · Framer Motion · Leaflet · Vercel.

No UI component library. No CSS-in-JS. No state library.

## Conventions

- `lib/seed.ts` is the fallback source of truth; `lib/data.ts` reads Supabase
  first and falls back to seed with a warning. The site must always render.
- Admin routes build payloads from an **explicit column allowlist**. Never spread
  the request body into an insert or update.
- Client components only where interactivity requires it. Pages stay static/ISR.
- Category colours live in `lib/eventCategories.ts`. One source, used by calendar
  dots, filter pills, map markers and badges.
- **Colour contrast is enforced by the build.** `npm run build` runs
  `prebuild` → `scripts/check-contrast.mjs` first; a failing pair exits
  non-zero and `next build` never starts. Do not bypass it, and do not remove
  the `prebuild` hook to get a build through.
  - The script reads hex values straight out of `app/globals.css`, so it can
    never drift from the theme.
  - **Adding a colour pair to the design means adding it to `PAIRS` in that
    script.** An unlisted pair is an unchecked pair.
  - Run it alone with `npm run check:contrast`.
  - Decorative borders are deliberately exempt — see `docs/DECISIONS.md` #27
    before "fixing" that.
- Colours come from the semantic tokens in `globals.css` (`--surface-*`,
  `--text-*`, `--border-*`) and the sand / teal / gold scales. Reach for those
  rather than raw `slate-*` values.
- Every photograph on the site is a named constant in `lib/images.ts`. Add new
  images there, not inline in a component — swapping placeholders for real
  client photography must stay a one-line change per image.
- Motion: entrance animations use `whileInView`. Respect `prefers-reduced-motion`
  except where `MotionProvider` deliberately overrides it (see DECISIONS #9).

## Tests

There is an end-to-end suite. Use it — it exists because a week of sessions
ended with "I could not verify this without a browser."

```bash
npm run test:e2e       # headless; builds and starts the app itself
npm run test:e2e:ui    # debug a failure
```

- Runs against a **production build**, never `next dev`. Route-level `robots`
  metadata, middleware and ISR only behave correctly in a production build.
- **~34 tests need a test Supabase project** and skip with a printed reason
  without one. Skipping is not passing — say which ones skipped when reporting.
- **Never point it at production.** It creates and deletes real users. The
  fixtures refuse the production ref and read `TEST_*` only. Setup is in
  `docs/RUNBOOK.md` → Running the E2E suite.
- When you add a feature that touches auth, privacy or the admin surface, add
  the test in the same commit. `e2e/privacy.spec.ts` is the model: assert the
  rendered page **and** the API payload, because a field hidden in the UI but
  present in the JSON is still a leak.
- `KNOWN_VIOLATIONS` in `e2e/a11y.spec.ts` is empty on purpose. Do not add to it
  to make a failure go away, and do not drop an axe rule globally.
- Two tests are load-bearing security regressions — read them before changing
  auth: the non-admin-token check in `e2e/admin.spec.ts` (DECISIONS #15) and
  the self-elevation checks in `e2e/privacy.spec.ts`.

## Working agreement

- Small commits, imperative subject lines: `fix:`, `feat:`, `polish:`, `docs:`.
- Run `npm run build` before pushing. Report the route count and First Load JS.
- If you could not verify something (no browser, no credentials), **say so
  explicitly**. Do not imply verification you did not perform.
- If a decision here looks wrong, say why rather than silently working around it.

## Update this file

When you change architecture, auth, or the roadmap, update the relevant doc in
the same commit as the code. A doc that lags the code is worse than no doc.
