import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { isMemberStatus } from "@/lib/roles";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = (url.searchParams.get("q") ?? "").trim().slice(0, 100);

  let query = supabase
    .from("profiles")
    .select("*, institutions(name)")
    .order("created_at", { ascending: false });

  if (status && isMemberStatus(status)) query = query.eq("status", status);
  if (search) {
    const safe = search.replace(/[%,()]/g, " ");
    query = query.or(`full_name.ilike.%${safe}%,headline.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[admin/members] query failed", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Admins legitimately need contact details for vetting, so this route reads
  // profiles directly rather than the consent-masked directory view. Emails
  // live in auth.users and are attached here.
  const withEmail = await Promise.all(
    (data ?? []).map(async (row) => {
      const { data: u } = await supabase.auth.admin.getUserById(row.id);
      return { ...row, email: u?.user?.email ?? null };
    })
  );

  // Counts for the tab badges.
  const { data: allStatuses } = await supabase.from("profiles").select("status");
  const counts = (allStatuses ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ data: withEmail, counts });
}
