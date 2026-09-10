import { NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password-reset throttle: 3 requests per IP per hour.
 *
 * The reset itself is issued browser-side by supabase.auth.resetPasswordForEmail,
 * which this app cannot intercept, so the page calls this first and only
 * proceeds on a 200. A deterrent against using the endpoint to mail-bomb an
 * address; Supabase's own auth rate limits remain the backstop.
 *
 * Lower than the signup limit (3 vs 5) because a legitimate person needs one
 * reset email, not five.
 *
 * ORDER MATTERS: validate, THEN rate-limit (DECISIONS #12). A typo'd address
 * must not burn a slot — that bug already shipped once on the contact form,
 * where three malformed submissions locked the sender out for an hour.
 *
 * This route deliberately reveals nothing about whether an address is
 * registered. It only ever reports on the request's own shape and frequency.
 */
export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!emailRe.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 422 }
    );
  }

  const ip = getClientIP(request);
  const rl = checkRateLimit(`connect-reset:${ip}`, 3);

  if (!rl.ok) {
    const mins = Math.max(1, Math.ceil(rl.retryAfterMs / 60000));
    return NextResponse.json(
      {
        ok: false,
        error: `Too many reset requests from this network. Please try again in about ${mins} minute${mins === 1 ? "" : "s"}.`,
      },
      { status: 429 }
    );
  }

  return NextResponse.json({ ok: true });
}
