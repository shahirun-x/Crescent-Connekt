# Decision log

Why things are the way they are. Read before reversing something that looks odd.
Append new entries; do not rewrite old ones.

---

**1. Supplements, never replaces.**
Institution cards link **out** to official sites. The portal is a coordination
layer, not a replacement. This is the client's core framing — every content
decision follows from it.

**2. Central Calendar is top-level navigation.**
It is the reason the project exists: institutions publish here so major events
do not clash. Not buried under Events.

**3. Seed fallback always available.**
`lib/data.ts` reads Supabase first, falls back to `lib/seed.ts` with a warning.
A database outage costs freshness, not availability. Keep the seed current.

**4. No UI component library.**
Tailwind and Framer Motion only. Full design control, small bundle, no upgrade
treadmill. The cost is writing our own primitives; accepted.

**5. Leaflet over Google Maps.**
No API key, no billing, open tiles. CARTO's `basemaps.cartocdn.com` — the older
`cartodb-basemaps-*.fastly.net` endpoint is deprecated and watermarks tiles with
"API KEY REQUIRED".

**6. `CalendarExplorer` owns shared state.**
Calendar grid, filters and event list must share state. Two sibling client
components under a server component cannot. A common client parent is required —
this is not a stylistic choice.

**7. Custom map clustering.**
~13 km proximity grouping, hand-rolled. Avoids a plugin dependency and its
default styling, which does not match the site.

**8. Scroll-zoom disabled on the map.**
Ctrl/⌘ to zoom; pinch works on touch. Scroll hijack is a common complaint and
worse on mobile.

**9. `MotionProvider` with `reducedMotion="never"`.**
Newer Framer defaults can leave `whileInView` content stuck at `opacity: 0` for
reduced-motion users — content becomes invisible, not just static. Reveals are
handled explicitly instead. Revisit only with a real reduced-motion test.

**10. Institution data is client truth.**
Names, URLs, addresses, parent orgs come from the official directory card. Do
not "correct" from web search. Where no site exists, the card shows a search
fallback — that is intentional, not missing data.

**11. Founding year is 1968, not 1967.**
Chetpet 1968, moved to Vandalur 1971. Corrected across hero, timeline and About.

**12. Validate before rate-limiting.**
`checkRateLimit` ran first; malformed submissions burned quota and locked the
caller out at 429 before anything reached the database. Order is now
validate → rate-limit → act.

**13. No `.select()` on anonymous inserts.**
Anon has INSERT but not SELECT on form tables. `.select()` sends
`return=representation`, which needs SELECT, and fails with RLS `42501`.

**14. Explicit column allowlists in admin write routes.**
Spreading the request body caused the `institution_name` failure (the column
does not exist — the public layer resolves names via FK join) and pushed
`created_at`/`updated_at` back into updates. Allowlist both fields and payload.

**15. Admin is a grant, not a session.**
`public.admins` row required. A valid Supabase token is not authorisation once
members can sign up. Full reasoning in `docs/SECURITY.md`.

**16. Separate cookie namespaces.**
Admin `sb-access-token`, member `cg-member-token`. One Auth project, two
sessions that never mix.

**17. `is_approved_member()` is `SECURITY DEFINER`.**
The profiles policy must query profiles — infinite recursion without it.

**18. Status enforced by trigger, not policy.**
RLS is row-level. A member updating their own `status` is still their own row,
so no UPDATE policy can stop it. The trigger permits status changes only from
the service role.

**19. `directory_profiles` masks columns for every caller.**
Including the service role. UI-level hiding leaks through a stray `select('*')`.

**20. Admin approval over open signup.**
Chosen with the client. An alumni directory where anyone can self-register and
immediately browse hundreds of members is a privacy problem. One extra admin
screen; protects the network.

**21. Contact details hidden by default.**
`show_email` / `show_phone` default to `false`. Consent is opt-in, never
assumed, and enforced in the view rather than the UI.

**22. `connect_signups` retained after Connect launches.**
Pre-launch early-access emails are real leads. Marked as pre-launch in admin
rather than deleted.

**23. Alumni card is a CTA, not a pillar.**
It stays solid Crescent blue with white text. Tinting it like the four pillar
cards would break contrast; it does a different job.

**24. `SITE_URL` hardcodes the production fallback.**
Also ignores any `localhost` value. An empty or wrong env var was emitting
`localhost:3000` into canonical and OG tags in production.

**25. Docs written before the Connect migration was applied.**
The security model changed materially in one session. Writing it down while the
reasoning was fresh, rather than after, was the point.

**26. A `"use client"` page cannot export `metadata` — it silently inherits.**
This is the quiet one. A client component cannot export `metadata`, and Next
does not warn: the page simply inherits the root layout's values, including
`robots: { index: true, follow: true }`.

Three routes were therefore live and crawlable, each emitting
`<meta name="robots" content="index, follow">`: `/connect/login`,
`/connect/signup` and `/connect/callback`. The last is the serious one —
Supabase returns the session in the URL fragment, so that URL is one that has
carried credentials and must never be indexed or cached.

The fix is a thin `layout.tsx` beside the page, exporting the metadata the page
cannot. See `app/connect/login/layout.tsx`.

The general rule, both directions:

- Any **new** client-component route that should not be indexed needs its own
  `layout.tsx` with `robots: { index: false, follow: false }`. There is no
  other way to attach metadata to it.
- **Converting an existing server page to a client component silently drops its
  metadata** — title, description, canonical and robots all revert to the
  parent's. Nothing fails, nothing warns; the page just starts advertising the
  wrong thing. If you add `"use client"` to a page that had a `metadata`
  export, move that export to a sibling layout in the same commit.

Because this fails silently, do not verify it by reading source. Build and grep
the output:

```
grep -o '<meta name="robots" content="[^"]*"' .next/server/app/<route>.html
```

Defence in depth: `next.config.ts` also sets `X-Robots-Tag` on `/api/:path*`,
`/admin/:path*` and `/connect/:path+`, which covers JSON responses and
redirects that never render a meta tag at all.
