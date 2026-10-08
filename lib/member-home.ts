import type { SupabaseClient } from "@supabase/supabase-js";
import { ROLES_WITH_BATCH_YEAR, type MemberRole, type MemberStatus } from "./roles";

/**
 * Data for /connect/home.
 *
 * EVERY function here takes the member-session client from `getMemberDb()`.
 * None of them may be called with the service-role client — the page's privacy
 * guarantee is that RLS, evaluated as this member, decides what comes back.
 *
 * Rules that hold for every query below:
 *  - Other members are read ONLY from `directory_profiles`, never `profiles`.
 *  - The column list is explicit and never includes `email` or `phone`, so a
 *    contact detail cannot reach the page, or the RSC payload sent to the
 *    browser, even if a member has consented to share it. The home page has no
 *    use for them; the profile page is where contact details live.
 *  - `.eq("status", "approved")` is applied even though RLS already enforces
 *    it — two independent locks, so neither one failing alone leaks a pending,
 *    rejected or suspended member.
 *  - A failed query returns an empty result and logs; it never falls back to
 *    a more privileged client.
 */

/** "Today" in India, where every institution is — not the server's UTC date. */
export function todayInIndia(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/**
 * Institution ids are slugs (`crescent-school-vandalur`). One is interpolated
 * into a PostgREST `or()` filter string below, where a comma or parenthesis
 * would change the filter's meaning. The id comes from the member's own row and
 * is FK-checked against institutions, so this should never fire — it exists so
 * a future change to how ids are minted cannot turn into a filter injection.
 */
export function safeInstitutionId(id: string | null): string | null {
  return id && /^[a-z0-9-]+$/i.test(id) ? id : null;
}

function logFailure(what: string, error: { code?: string; message?: string }) {
  console.error(`[connect/home] ${what} failed`, {
    code: error.code,
    message: error.message,
  });
}

// ---------------------------------------------------------------------------
// The member themselves
// ---------------------------------------------------------------------------

export interface OwnProfile {
  id: string;
  full_name: string;
  role: MemberRole;
  status: MemberStatus;
  institution_id: string | null;
  batch_year: number | null;
  current_city: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
}

/**
 * The member's own row, from `profiles`.
 *
 * Reading your OWN row from the table is fine — RLS allows `id = auth.uid()`
 * and nothing here is anyone else's data. The column list still leaves out
 * email and phone: the page never shows them, so they never leave the server.
 */
export async function getOwnProfile(
  db: SupabaseClient,
  userId: string
): Promise<OwnProfile | null> {
  const { data, error } = await db
    .from("profiles")
    .select(
      "id, full_name, role, status, institution_id, batch_year, current_city, headline, bio, avatar_url, linkedin_url"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) logFailure("own profile", error);
  return (data as OwnProfile | null) ?? null;
}

export interface HomeInstitution {
  id: string;
  name: string;
  city: string;
  external_url: string;
}

export async function getInstitution(
  db: SupabaseClient,
  id: string | null
): Promise<HomeInstitution | null> {
  if (!id) return null;
  const { data, error } = await db
    .from("institutions")
    .select("id, name, city, external_url")
    .eq("id", id)
    .maybeSingle();
  if (error) logFailure("institution", error);
  return (data as HomeInstitution | null) ?? null;
}

// ---------------------------------------------------------------------------
// Profile completeness
// ---------------------------------------------------------------------------

export interface MissingField {
  key: "avatar" | "headline" | "bio" | "city" | "linkedin" | "batch_year";
  /** One sentence telling the member why it's worth adding. */
  prompt: string;
}

const blank = (v: string | null | undefined) => !v || !v.trim();

/**
 * What the member hasn't filled in yet.
 *
 * Batch year only counts for students and alumni — asking a parent or a
 * well-wisher for a graduation year would be asking for something that does
 * not exist, and would leave them stuck below 100% forever.
 */
export function profileCompleteness(p: OwnProfile): {
  done: number;
  total: number;
  missing: MissingField[];
} {
  const checks: [boolean, MissingField][] = [
    [!!p.avatar_url, { key: "avatar", prompt: "Add a photo so classmates can recognise you" }],
    [!blank(p.headline), { key: "headline", prompt: "Add a headline — one line on what you do now" }],
    [!blank(p.bio), { key: "bio", prompt: "Write a short bio so people know why to reach out" }],
    [!blank(p.current_city), { key: "city", prompt: "Add your city so people nearby can find you" }],
    [!blank(p.linkedin_url), { key: "linkedin", prompt: "Link your LinkedIn so people can see your work" }],
  ];
  if (ROLES_WITH_BATCH_YEAR.includes(p.role)) {
    checks.push([
      p.batch_year != null,
      { key: "batch_year", prompt: "Add your batch year so your year group can find you" },
    ]);
  }

  const missing = checks.filter(([ok]) => !ok).map(([, m]) => m);
  return { done: checks.length - missing.length, total: checks.length, missing };
}

// ---------------------------------------------------------------------------
// Upcoming events
// ---------------------------------------------------------------------------

export interface HomeEvent {
  id: string;
  title: string;
  date_start: string;
  date_end: string | null;
  location: string;
  institution_id: string | null;
  institution_name: string | null;
}

/**
 * The next few events at the member's institution plus network-wide ones
 * (institution_id null), soonest first. With no institution: network-wide only.
 *
 * "Upcoming" includes events already under way — a three-day festival that
 * started yesterday is still on.
 */
export async function getUpcomingEvents(
  db: SupabaseClient,
  institutionId: string | null,
  today: string,
  limit = 4
): Promise<HomeEvent[]> {
  institutionId = safeInstitutionId(institutionId);
  let q = db
    .from("events")
    .select("id, title, date_start, date_end, location, institution_id, institutions(name)")
    .or(`date_start.gte.${today},date_end.gte.${today}`)
    .order("date_start", { ascending: true })
    .limit(limit);

  q = institutionId
    ? q.or(`institution_id.eq.${institutionId},institution_id.is.null`)
    : q.is("institution_id", null);

  const { data, error } = await q;
  if (error) {
    logFailure("events", error);
    return [];
  }

  type Row = Omit<HomeEvent, "institution_name"> & {
    institutions: { name: string } | { name: string }[] | null;
  };
  return ((data ?? []) as unknown as Row[]).map(({ institutions, ...e }) => ({
    ...e,
    institution_name: Array.isArray(institutions)
      ? institutions[0]?.name ?? null
      : institutions?.name ?? null,
  }));
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

/**
 * The ONLY columns of another member this page reads. No email, no phone,
 * no consent flags — nothing the page does not render.
 */
const PERSON_COLUMNS =
  "id, full_name, role, batch_year, headline, avatar_url, current_city, institution_name, created_at";

export interface HomePerson {
  id: string;
  full_name: string;
  role: MemberRole;
  batch_year: number | null;
  headline: string | null;
  avatar_url: string | null;
  current_city: string | null;
  institution_name: string | null;
  created_at: string;
}

/**
 * Up to `limit` approved members, newest first, never the member themselves.
 *
 * With an institution: people from it, and anyone sharing the member's batch
 * year moves to the top — the classmate is the person most worth finding.
 * Without one: the newest members across the whole network.
 *
 * A wider window than `limit` is fetched so the batch-year ranking has
 * something to choose from; it is still newest-first within each group.
 */
export async function getPeople(
  db: SupabaseClient,
  self: { id: string; institution_id: string | null; batch_year: number | null },
  limit = 6
): Promise<HomePerson[]> {
  let q = db
    .from("directory_profiles")
    .select(PERSON_COLUMNS)
    .eq("status", "approved")
    .neq("id", self.id)
    .order("created_at", { ascending: false })
    .limit(limit * 5);

  if (self.institution_id) q = q.eq("institution_id", self.institution_id);

  const { data, error } = await q;
  if (error) {
    logFailure("people", error);
    return [];
  }

  const people = (data ?? []) as HomePerson[];
  if (self.institution_id && self.batch_year != null) {
    const mine = people.filter((p) => p.batch_year === self.batch_year);
    const rest = people.filter((p) => p.batch_year !== self.batch_year);
    return [...mine, ...rest].slice(0, limit);
  }
  return people.slice(0, limit);
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

export interface HomeNews {
  id: string;
  title: string;
  summary: string;
  published_at: string;
  institution_id: string | null;
}

/**
 * The latest news for the member's institution. When it has none, network-wide
 * news (institution_id null) instead, and `scope` says which one this is so
 * the page can label it honestly.
 */
export async function getNews(
  db: SupabaseClient,
  institutionId: string | null,
  limit = 3
): Promise<{ items: HomeNews[]; scope: "institution" | "network" }> {
  const cols = "id, title, summary, published_at, institution_id";

  if (institutionId) {
    const { data, error } = await db
      .from("news")
      .select(cols)
      .eq("institution_id", institutionId)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) logFailure("institution news", error);
    if (data && data.length) return { items: data as HomeNews[], scope: "institution" };
  }

  const { data, error } = await db
    .from("news")
    .select(cols)
    .is("institution_id", null)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) logFailure("network news", error);
  return { items: (data ?? []) as HomeNews[], scope: "network" };
}
