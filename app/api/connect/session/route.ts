import { NextResponse } from "next/server";
import { MEMBER_COOKIE, MEMBER_REFRESH_COOKIE } from "@/lib/connect-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Exchange a Supabase session for httpOnly member cookies.
 *
 * The browser client authenticates with Supabase directly, then hands the
 * tokens here. Storing them httpOnly keeps them out of reach of page scripts,
 * and keeps the member session in its own cookie namespace so it can never be
 * mistaken for an admin session.
 */
export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rl = checkRateLimit(`connect-session:${ip}`, 20);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: { access_token?: string; refresh_token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const accessToken = body.access_token;
  const refreshToken = body.refresh_token;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  // Never trust a client-supplied token — verify it with Supabase first.
  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .maybeSingle();

  const response = NextResponse.json({
    ok: true,
    hasProfile: !!profile,
    status: profile?.status ?? null,
  });

  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(MEMBER_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  if (refreshToken) {
    response.cookies.set(MEMBER_REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

/** Sign out — clear the member cookies. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(MEMBER_COOKIE);
  response.cookies.delete(MEMBER_REFRESH_COOKIE);
  return response;
}
