import { NextResponse } from "next/server";
import { getMemberUser } from "@/lib/connect-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { isMemberRole } from "@/lib/roles";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

function sanitize(s: unknown, max = 2000): string | null {
  if (typeof s !== "string") return null;
  const clean = s.replace(/[<>]/g, "").trim().slice(0, max);
  return clean.length ? clean : null;
}

function safeUrl(s: unknown): string | null {
  const v = sanitize(s, 500);
  if (!v) return null;
  try {
    const u = new URL(v);
    // Only ever store http(s) links — blocks javascript: and data: payloads.
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Build a profile payload from client input.
 *
 * SECURITY: `status`, `rejection_reason` and `id` are never taken from the
 * request. Status changes go only through the admin service-role route, and
 * the database trigger blocks them here as a second line of defence.
 */
function buildProfile(body: Record<string, unknown>) {
  const full_name = sanitize(body.full_name, 120);
  const role = body.role;

  if (!full_name || full_name.length < 2) {
    return { error: "Please enter your full name." as const };
  }
  if (!isMemberRole(role)) {
    return { error: "Please choose a valid role." as const };
  }

  let batch_year: number | null = null;
  if (body.batch_year !== null && body.batch_year !== undefined && body.batch_year !== "") {
    const n = Number(body.batch_year);
    const thisYear = new Date().getFullYear();
    if (!Number.isInteger(n) || n < 1950 || n > thisYear + 10) {
      return { error: "Please enter a valid batch year." as const };
    }
    batch_year = n;
  }

  return {
    row: {
      full_name,
      role,
      institution_id: sanitize(body.institution_id, 120),
      batch_year,
      current_city: sanitize(body.current_city, 120),
      current_country: sanitize(body.current_country, 120) ?? "India",
      headline: sanitize(body.headline, 160),
      bio: sanitize(body.bio, 2000),
      avatar_url: safeUrl(body.avatar_url),
      linkedin_url: safeUrl(body.linkedin_url),
      phone: sanitize(body.phone, 40),
      show_email: !!body.show_email,
      show_phone: !!body.show_phone,
    },
  };
}

/** Read your own profile. */
export async function GET() {
  const user = await getMemberUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[connect/profile] read failed", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data, email: user.email });
}

/** Create your profile (setup). Always lands as 'pending'. */
export async function POST(request: Request) {
  const user = await getMemberUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(`connect-profile:${getClientIP(request)}`, 5);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const built = buildProfile(await request.json());
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: 422 });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You already have a profile." },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: user.id, ...built.row, status: "pending" })
    .select()
    .single();

  if (error) {
    console.error("[connect/profile] insert failed", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

/** Update your own profile. Does not affect approval status. */
export async function PUT(request: Request) {
  const user = await getMemberUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  const built = buildProfile(await request.json());
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: 422 });
  }

  // Scoped to the caller's own id — a member can never update someone else.
  const { data, error } = await supabase
    .from("profiles")
    .update(built.row)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[connect/profile] update failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
