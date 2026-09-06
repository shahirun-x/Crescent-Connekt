# CLAUDE.md

Read this first, every session. It is the shared memory for this repo.

## What this is

**Crescent Global** — a portal for the Crescent Global Outreach Mission (CGOM).
It **supplements, never replaces** the websites of ~16 institutions under two
parent trusts. It is a glossary, a guide, and a coordination layer that unifies
and channels their collective efforts for the betterment of the alma mater.

Live: https://crescent-global-calender.vercel.app
Repo: https://github.com/shahirun-x/Crescent-Global-Calender
Supabase project ref: `zxffaohxxzbthspeelpj` (ap-south-1)

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
- Motion: entrance animations use `whileInView`. Respect `prefers-reduced-motion`
  except where `MotionProvider` deliberately overrides it (see DECISIONS #9).

## Working agreement

- Small commits, imperative subject lines: `fix:`, `feat:`, `polish:`, `docs:`.
- Run `npm run build` before pushing. Report the route count and First Load JS.
- If you could not verify something (no browser, no credentials), **say so
  explicitly**. Do not imply verification you did not perform.
- If a decision here looks wrong, say why rather than silently working around it.

## Update this file

When you change architecture, auth, or the roadmap, update the relevant doc in
the same commit as the code. A doc that lags the code is worse than no doc.
