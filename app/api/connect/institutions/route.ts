import { NextResponse } from "next/server";
import { getMemberUser } from "@/lib/connect-auth";
import { getSupabase } from "@/lib/supabase";
import { INSTITUTIONS } from "@/lib/seed";

export const runtime = "nodejs";

/**
 * Institution list for the profile setup and edit forms.
 *
 * Institutions are public data, but this endpoint still requires a signed-in
 * member so the Connect surface has one consistent auth story. Falls back to
 * bundled seed data if Supabase is unreachable, so setup never dead-ends.
 */
export async function GET() {
  const user = await getMemberUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("institutions")
      .select("id, name, city, category")
      .order("name", { ascending: true });

    if (!error && data?.length) return NextResponse.json({ data });
    if (error) console.warn("[connect/institutions] falling back to seed", error.message);
  }

  return NextResponse.json({
    data: INSTITUTIONS.map((i) => ({
      id: i.id,
      name: i.name,
      city: i.city,
      category: i.category,
    })),
  });
}
