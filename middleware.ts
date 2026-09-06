import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const config = {
  matcher: ["/admin/:path*", "/connect/:path*"],
};

const MEMBER_COOKIE = "cg-member-token";

/** Member routes that require a signed-in, approved member. */
const MEMBER_PROTECTED = ["/connect/directory", "/connect/profile"];

/** Member routes that require sign-in but not approval. */
const MEMBER_AUTHED = ["/connect/setup", "/connect/pending", "/connect/status"];

function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) return adminGate(request, pathname);
  if (pathname.startsWith("/connect")) return connectGate(request, pathname);
  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Admin — unchanged behaviour, plus an explicit admins-table check.
// ---------------------------------------------------------------------------
async function adminGate(request: NextRequest, pathname: string) {
  if (pathname === "/admin/login") return NextResponse.next();

  const accessToken = request.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const supabase = serviceClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("sb-access-token");
    return response;
  }

  // A valid Supabase user is not automatically an admin — members have valid
  // tokens too. Administrator is an explicit grant in public.admins.
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminRow) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("sb-access-token");
    return response;
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Crescent Connect — separate cookie, separate rules.
// ---------------------------------------------------------------------------
async function connectGate(request: NextRequest, pathname: string) {
  const needsApproval = MEMBER_PROTECTED.some((p) => pathname.startsWith(p));
  const needsAuth =
    needsApproval || MEMBER_AUTHED.some((p) => pathname.startsWith(p));

  // Public Connect pages: landing, login, signup, auth callback.
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get(MEMBER_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/connect/login", request.url));
  }

  const supabase = serviceClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/connect/login", request.url));
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    const response = NextResponse.redirect(new URL("/connect/login", request.url));
    response.cookies.delete(MEMBER_COOKIE);
    return response;
  }

  if (!needsApproval) return NextResponse.next();

  // Directory and member profiles require an approved profile.
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.redirect(new URL("/connect/setup", request.url));
  }
  if (profile.status === "pending") {
    return NextResponse.redirect(new URL("/connect/pending", request.url));
  }
  if (profile.status !== "approved") {
    return NextResponse.redirect(new URL("/connect/status", request.url));
  }

  return NextResponse.next();
}
