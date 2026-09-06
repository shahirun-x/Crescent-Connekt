-- Crescent Global — query performance indexes
-- Run AFTER migration-connect.sql. Idempotent and safe to re-run.
--
-- DO NOT APPLY BLIND. Read the reasoning per index. Every index here maps to a
-- query the application actually issues; none are speculative. Indexes are not
-- free — each one is written on every INSERT and UPDATE to its table.
--
-- Evidence base: EXPLAIN was run against the live project. With the tables
-- still near-empty the absolute costs are meaningless, so the reasoning below
-- leans on plan SHAPE (seq scan vs index scan, Filter vs Index Cond) rather
-- than timings, plus the known access patterns in the API routes.

-- ===========================================================================
-- 1. Unindexed foreign keys — events.institution_id, news.institution_id
-- ===========================================================================
--
-- Confirmed missing on the live database:
--   select conrelid::regclass, a.attname, exists(...) → has_index = false
--
-- Two separate costs:
--
--   a) lib/data.ts joins the parent on every public read:
--        .select("..., institutions(name)")
--      PostgREST resolves that as a join on institutions.id = events.institution_id.
--      Without an index the child side is a sequential scan per query.
--
--   b) Both FKs are ON DELETE SET NULL. Postgres must find referencing rows
--      whenever an institution is deleted; with no index that is a full scan
--      of events and news. Institutions are edit-only in admin today, so this
--      is latent rather than active — but it is exactly the kind of thing that
--      bites during a future data cleanup.
--
create index if not exists events_institution_id_idx
  on public.events (institution_id);

create index if not exists news_institution_id_idx
  on public.news (institution_id);

-- ===========================================================================
-- 2. Directory: filter + sort in one index
-- ===========================================================================
--
-- /api/connect/directory ALWAYS applies .eq("status","approved") and then
-- orders by created_at DESC (default) or full_name ASC, with .range() for
-- 24-per-page. Observed plan today:
--
--   Index Scan using profiles_status_idx on profiles
--     Index Cond: (status = 'approved')
--     Filter: (role = ANY (...)) AND (full_name ~~* '%…%' OR headline ~~* '%…%')
--   -> Sort  Sort Key: p.created_at DESC
--
-- The existing profiles_status_idx handles the equality but the sort is a
-- separate step, so every page load sorts the whole approved set to return 24
-- rows. A composite whose leading column is the constant filter and whose
-- second column matches the ORDER BY lets the planner walk the index in order
-- and stop at 24 — no sort node at all.
--
-- These are PARTIAL (WHERE status = 'approved'). The directory never queries
-- any other status, so indexing pending/rejected/suspended rows would only add
-- write cost and index size for reads that never happen.

-- Default listing: "Recently joined"
create index if not exists profiles_directory_recent_idx
  on public.profiles (created_at desc)
  where status = 'approved';

-- Alternate sort: "Name A–Z"
create index if not exists profiles_directory_name_idx
  on public.profiles (full_name)
  where status = 'approved';

-- Role is the most-used facet in the UI (a multi-select chip row, so it is
-- applied far more often than city or batch). Pairing it with created_at means
-- a role-filtered page is still filter-then-ordered-walk rather than sort.
create index if not exists profiles_directory_role_idx
  on public.profiles (role, created_at desc)
  where status = 'approved';

-- ===========================================================================
-- 3. Directory search — trigram, not full-text. The choice matters.
-- ===========================================================================
--
-- The route builds:
--   full_name.ilike.%term%, headline.ilike.%term%, institution_name.ilike.%term%
--
-- That is an INFIX match with a leading wildcard. Two candidate index types:
--
--   Full-text (tsvector + GIN)
--     Indexes whole lexemes after stemming. Fast, small, great for prose.
--     But it CANNOT serve a leading-wildcard ILIKE. Searching "khan" would
--     not match "Khanna", and "raj" would not match "Neelakandan Raja" as a
--     substring. It also stems, which is wrong for proper nouns — the bulk of
--     what people type into a member directory is a partial name.
--
--   Trigram (pg_trgm + GIN)  ← chosen
--     Indexes overlapping 3-character sequences, so it supports ILIKE with
--     wildcards on both sides directly, with no query rewrite. It is exactly
--     the operator the application already emits, and it degrades gracefully
--     on typos. The cost is a larger index and slower writes — acceptable on
--     a table written once per signup and read on every directory page.
--
-- Decision: trigram. The search box is a name-prefix/substring finder, not a
-- document search, and matching real people's partial names is the whole job.
-- Revisit only if the directory grows a long-form bio search, where full-text
-- would then be the better tool for THAT field specifically.

create extension if not exists pg_trgm;

create index if not exists profiles_full_name_trgm_idx
  on public.profiles using gin (full_name gin_trgm_ops);

create index if not exists profiles_headline_trgm_idx
  on public.profiles using gin (headline gin_trgm_ops);

-- The city filter is also an ILIKE substring match (.ilike("current_city", "%…%")),
-- so it needs trigram for the same reason a btree would not help.
create index if not exists profiles_current_city_trgm_idx
  on public.profiles using gin (current_city gin_trgm_ops);

-- Note: institution_name in the search OR-clause lives on institutions, not
-- profiles, and is reached through the view's join. institutions has 16 rows
-- and is scanned trivially — no index needed there, and adding one would be
-- the definition of speculative.

-- ===========================================================================
-- 4. Reviewed and deliberately NOT added
-- ===========================================================================
--
-- profiles(status)          — already exists (profiles_status_idx), used.
-- profiles(institution_id)  — already exists, covers the institution facet.
-- profiles(batch_year)      — already exists, covers the batch range filter.
-- events(date_start)        — already exists, used by the calendar ordering.
-- news(published_at DESC)   — already exists, used by the news ordering.
-- connect_signups(email)    — already a UNIQUE constraint, which is an index.
--
-- contacts(created_at) / contacts(is_read):
--   The admin route orders contacts by created_at and counts unread. Skipped
--   deliberately: this table is a contact form on a institutional site, so it
--   will hold hundreds of rows, not millions. A sequential scan over that is
--   faster than an index lookup, and Postgres will ignore the index anyway.
--   Add it if the table ever passes ~10k rows.
--
-- Redundancy to watch (not dropped here — dropping needs live evidence):
--   profiles_role_idx is now partially superseded by profiles_directory_role_idx
--   for approved rows. It still serves /admin/members, which queries every
--   status. Keep both until pg_stat_user_indexes shows one unused:
--     select indexrelname, idx_scan from pg_stat_user_indexes
--     where relname = 'profiles' order by idx_scan;

-- ===========================================================================
-- 5. After applying
-- ===========================================================================
--
-- Refresh planner statistics, or the new indexes may be ignored until
-- autovacuum next runs:
analyze public.profiles;
analyze public.events;
analyze public.news;
