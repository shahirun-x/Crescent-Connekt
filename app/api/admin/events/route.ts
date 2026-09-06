import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

function sanitize(s: string): string {
  return s.replace(/[<>]/g, "").trim();
}

/**
 * Build a payload containing only real columns on public.events.
 * `institution_name` is NOT a column — it is resolved via the
 * institutions FK join in the public data layer, so it must never
 * be forwarded to Supabase.
 */
function buildRow(body: Record<string, unknown>, partial: boolean) {
  const row: Record<string, unknown> = {};

  const setStr = (key: string) => {
    if (partial && body[key] === undefined) return;
    row[key] = sanitize(String(body[key] ?? ""));
  };

  setStr("title");
  setStr("location");
  setStr("description");

  if (!partial || body.date_start !== undefined) row.date_start = body.date_start;
  if (!partial || body.date_end !== undefined) row.date_end = body.date_end || null;
  if (!partial || body.institution_id !== undefined)
    row.institution_id = body.institution_id || null;
  if (!partial || body.category !== undefined) row.category = body.category;
  if (!partial || body.is_featured !== undefined)
    row.is_featured = !!body.is_featured;
  if (!partial || body.image_url !== undefined) row.image_url = body.image_url || null;

  return row;
}

function revalidateEventPaths() {
  revalidatePath("/");
  revalidatePath("/calendar");
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date_start", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const body = await request.json();
  const row = buildRow(body, false);

  const { data, error } = await supabase.from("events").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateEventPaths();
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const body = await request.json();
  const id = body.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const row = buildRow(body, true);

  const { data, error } = await supabase
    .from("events")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateEventPaths();
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateEventPaths();
  return NextResponse.json({ ok: true });
}
