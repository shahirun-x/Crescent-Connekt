-- ============================================================================
-- migration-rebrand.sql — Crescent Global / CGOM  ->  Crescent Connekt
-- ============================================================================
--
-- DO NOT RUN THIS AUTOMATICALLY. Review it, then apply it by hand in the
-- Supabase SQL editor (CLAUDE.md hard rule 1).
--
-- WHY THIS EXISTS
--
-- Crescent Connekt and the Crescent Global Outreach Mission are now separate
-- projects. The site copy was rewritten in lib/seed.ts, but seed.ts is only
-- the FALLBACK source of truth — lib/data.ts reads Supabase first. The same
-- rows exist in production and would keep serving the old brand. These
-- statements bring the database in line with the rewritten seed, verbatim.
--
-- WHAT IS DELIBERATELY NOT RENAMED
--
-- Table, column, policy and row-id names are untouched. `news-cgom-launch` is
-- a primary key: renaming it would orphan the row rather than rebrand it, and
-- every other identifier carrying the old name is internal and invisible to
-- users. The rebrand is user-facing copy only.
--
-- IDEMPOTENT: every statement is keyed by id and rewrites to a fixed value,
-- so running it twice is harmless.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

-- NOTE: events and news have no institution_name column. The name is joined
-- from public.institutions, and these rows have a null institution_id, so
-- lib/data.ts renders the literal "Crescent Network" for them. Nothing to
-- update here beyond the copy.
update public.events set
  title       = 'Crescent Alumni Meet',
  description = 'A worldwide gathering of Crescent alumni to connect chapters, mentor students and grow the Member Network.'
where id = 'evt-alumni-global-meet-2026';

update public.events set
  description = 'Synchronised opening assembly across every campus, opening the academic year on the same day across the network.'
where id = 'evt-academic-year-open-2026';

-- ---------------------------------------------------------------------------
-- News
-- ---------------------------------------------------------------------------

update public.news set
  title   = 'Crescent Connekt opens a shared portal for the network',
  summary = 'One calendar, one news stream and one directory across all sixteen institutions of the Crescent family.',
  content = 'Crescent Connekt is now live: a platform that supplements — but never replaces — the individual websites of the sixteen institutions across Chennai, Kilakarai, Madurai and Nagore. It brings a shared calendar so major events stop clashing, a single news stream, and one directory that points outward to each institution''s own site.'
where id = 'news-cgom-launch';

update public.news set
  content = 'Following coordination through Crescent Connekt, the network''s schools have published a common calendar of examinations, holidays and inter-school events for the coming year.'
where id = 'news-schools-common-calendar';

-- The timeline has no table. It is served from lib/seed.ts only (see
-- lib/data.ts getTimeline), so the 2024 entry was rebranded in code and needs
-- nothing here.

-- ---------------------------------------------------------------------------
-- Safety net: any row the editors added after the seed was written.
-- Reported, not rewritten — a blind UPDATE ... replace() across free text is
-- how a rebrand mangles a sentence. Run this, read the output, fix by hand.
-- ---------------------------------------------------------------------------
--
--   select 'events' as t, id, title from public.events
--     where title ilike '%crescent global%' or title ilike '%cgom%'
--        or description ilike '%crescent global%' or description ilike '%cgom%'
--   union all
--   select 'news', id, title from public.news
--     where title ilike '%crescent global%' or title ilike '%cgom%'
--        or summary ilike '%crescent global%' or content ilike '%cgom%'
--        or content ilike '%crescent global%';

commit;
