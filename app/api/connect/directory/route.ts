import { NextResponse } from "next/server";
import { getMemberUser, getMemberProfile } from "@/lib/connect-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { isMemberRole } from "@/lib/roles";

export const runtime = "nodejs";

const PAGE_SIZE = 24;

/**
 * Members-only directory listing.
 *
 * Reads from the directory_profiles VIEW, never from profiles, so email and
 * phone are already masked by each member's consent flags at the database
 * level. Unauthenticated or unapproved callers get 401/403 — never an empty
 * list, which would read as "no members" rather than "not allowed".
 */
export async function GET(request: Request) {
  const user = await getMemberUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getMemberProfile(user.id);
  if (!profile || profile.status !== "approved") {
    return NextResponse.json(
      { error: "Your membership is not approved." },
      { status: 403 }
    );
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const url = new URL(request.url);
  const page = Math.max(0, Number(url.searchParams.get("page") ?? 0) || 0);
  const search = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const roles = (url.searchParams.get("roles") ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter(isMemberRole);
  const institution = (url.searchParams.get("institution") ?? "").trim();
  const city = (url.searchParams.get("city") ?? "").trim().slice(0, 100);
  const yearFrom = Number(url.searchParams.get("yearFrom")) || null;
  const yearTo = Number(url.searchParams.get("yearTo")) || null;
  const sort = url.searchParams.get("sort") === "name" ? "name" : "recent";

  let query = supabase
    .from("directory_profiles")
    .select("*", { count: "exact" })
    .eq("status", "approved");

  if (search) {
    const safe = search.replace(/[%,()]/g, " ");
    query = query.or(
      `full_name.ilike.%${safe}%,headline.ilike.%${safe}%,institution_name.ilike.%${safe}%`
    );
  }
  if (roles.length) query = query.in("role", roles);
  if (institution) query = query.eq("institution_id", institution);
  if (city) query = query.ilike("current_city", `%${city.replace(/[%,()]/g, " ")}%`);
  if (yearFrom) query = query.gte("batch_year", yearFrom);
  if (yearTo) query = query.lte("batch_year", yearTo);

  query =
    sort === "name"
      ? query.order("full_name", { ascending: true })
      : query.order("created_at", { ascending: false });

  const from = page * PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);

  if (error) {
    console.error("[connect/directory] query failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    count: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    hasMore: (count ?? 0) > from + PAGE_SIZE,
  });
}
