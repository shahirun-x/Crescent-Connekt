import { NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Signup throttle: 5 new accounts per IP per hour.
 *
 * Account creation itself happens browser-side against Supabase Auth, which
 * this app cannot intercept — so the signup page calls this first and only
 * proceeds on a 200. It is a deterrent against bulk automated signup, not a
 * hard guarantee; Supabase's own auth rate limits remain the backstop.
 */
export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rl = checkRateLimit(`connect-signup:${ip}`, 5);

  if (!rl.ok) {
    const mins = Math.max(1, Math.ceil(rl.retryAfterMs / 60000));
    return NextResponse.json(
      {
        ok: false,
        error: `Too many sign-up attempts from this network. Please try again in about ${mins} minute${mins === 1 ? "" : "s"}.`,
      },
      { status: 429 }
    );
  }

  return NextResponse.json({ ok: true });
}
