# Crescent Global

A modern, lightweight, responsive portal that unifies the **Crescent ecosystem** —
schools, colleges, a university, hospitals and community initiatives across India
and beyond. It is a **glossary, guide and coordination layer**; it supplements,
and does not replace, each institution's own website.

## Tech stack

| Area        | Choice                                            |
| ----------- | ------------------------------------------------- |
| Framework   | Next.js 15 (App Router, TypeScript)              |
| Styling     | Tailwind CSS v4 (`@theme` tokens, no config file) |
| Data        | Supabase (PostgreSQL) — optional, with fallback   |
| Animation   | Framer Motion (subtle, respects reduced-motion)   |
| Deployment  | Vercel-ready (`vercel.json` included)             |

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

The site **runs with zero configuration** — every page falls back to the bundled
seed data in [`lib/seed.ts`](lib/seed.ts). To enable the live database and the
contact / early-access forms, set:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Supabase setup

Full procedure, in order, with the hazards called out:
**[`docs/RUNBOOK.md`](docs/RUNBOOK.md) → First-time setup.**

Five SQL files, applied in sequence: `schema.sql` → `seed.sql` →
`migration-admin.sql` → `migration-images.sql` → `migration-connect.sql`.

> Read [`docs/SECURITY.md`](docs/SECURITY.md) before applying
> `migration-connect.sql`. It bootstraps the `admins` table from existing auth
> users and must be applied **before** any member signs up.

Tables: `institutions`, `events`, `news`, `contacts`, `connect_signups`,
`profiles`, `admins`, plus the `directory_profiles` view.
Row-level security allows public **read** on content tables, public **insert**
on the two form tables, and members-only access to profiles.

## Documentation

| Doc | Covers |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Conventions and hard rules — read first |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Data flow, rendering, auth surfaces |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Threat model, RLS design, known gaps |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | What's next, scale readiness |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Why things are the way they are |
| [`docs/RUNBOOK.md`](docs/RUNBOOK.md) | Setup, deploys, migrations, incidents |

## Pages

| Route           | Rendering | Notes                                              |
| --------------- | --------- | -------------------------------------------------- |
| `/`             | ISR 1h    | Hero, ecosystem, live events, journey timeline     |
| `/institutions` | ISR 24h   | Filter by pillar / search; cards link out          |
| `/calendar`     | ISR 10m   | **Top-level nav.** Today / Week / Month / Year     |
| `/news`         | ISR 10m   | Unified news **and events** stream, type + institution filters |
| `/connect`      | Dynamic   | Crescent Connect landing; session-aware CTAs       |
| `/connect/*`    | Dynamic   | Members-only: signup, setup, directory, profiles   |
| `/admin/*`      | Dynamic   | Admin dashboard, auth-gated                        |
| `/about`        | ISR 24h   | Vision, mission, full timeline, CGOM note          |
| `/contact`      | Static    | Contact form (posts to `/api/contact`)             |

## Editing content

- **Without Supabase:** edit [`lib/seed.ts`](lib/seed.ts).
- **With Supabase:** edit rows in the dashboard; pages revalidate on the ISR
  schedule above.
- Institution `external_url` values marked `// TODO verify` in `lib/seed.ts`
  should be confirmed against each official website.

## Accessibility & performance

- Mobile-first, tested at 375 / 768 / 1024 / 1440 px.
- Skip-link, semantic landmarks, `aria-current`, focus-visible rings, `aria-live`
  result counts, `prefers-reduced-motion` honoured.
- No external fonts or UI libraries; inline SVG logo; minimal client JS
  (only the interactive filters and forms are client components).

## Deploy to Vercel

Push to a Git repo, import into Vercel, add the environment variables, deploy.
`next build` output is static + ISR — no server configuration required.
