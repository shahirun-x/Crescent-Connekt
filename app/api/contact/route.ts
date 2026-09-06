import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface Body {
  name?: string;
  email?: string;
  message?: string;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str: string): string {
  return str.replace(/[<>]/g, "").trim();
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }

  const name = sanitize(body.name ?? "");
  const email = sanitize(body.email ?? "");
  const message = sanitize(body.message ?? "");

  // Validate BEFORE consuming a rate-limit slot. Otherwise a few typos lock
  // the visitor out for an hour without a single message ever being sent.
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Please enter your name (at least 2 characters).";
  if (!emailRe.test(email)) fieldErrors.email = "Please enter a valid email address.";
  if (message.length < 10)
    fieldErrors.message = `Your message is too short — please write at least 10 characters (currently ${message.length}).`;

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: Object.values(fieldErrors)[0],
        fieldErrors,
      },
      { status: 422 }
    );
  }

  // Only well-formed submissions count against the limit.
  const ip = getClientIP(request);
  const rl = checkRateLimit(`contact:${ip}`, 3);
  if (!rl.ok) {
    const mins = Math.max(1, Math.ceil(rl.retryAfterMs / 60000));
    return NextResponse.json(
      {
        ok: false,
        error: `You've sent a few messages already. Please try again in about ${mins} minute${mins === 1 ? "" : "s"}, or email us directly.`,
      },
      { status: 429 }
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.error(
      "[contact] Supabase is not configured — NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing at runtime."
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          "Our message system is temporarily unavailable. Please email us directly and we'll get straight back to you.",
      },
      { status: 503 }
    );
  }

  // Insert only the three writable columns. id, created_at, is_read and
  // updated_at all have database defaults. No .select() here — anon has
  // INSERT but no SELECT policy, so asking for the row back would fail RLS.
  const { error } = await supabase.from("contacts").insert({ name, email, message });

  if (error) {
    console.error("[contact] Supabase insert failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      {
        ok: false,
        error: `We couldn't save your message (${error.message}). Please email us directly.`,
      },
      { status: 500 }
    );
  }

  // Optional: send email notification via Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Crescent Global <noreply@crescentglobal.org>",
          to: "connect@crescentglobal.org",
          subject: `New contact form: ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        }),
      });
      if (!res.ok) {
        console.error("[contact] Resend notification failed", await res.text());
      }
    } catch (e) {
      // Email is optional — the message is already saved, so never fail here.
      console.error("[contact] Resend notification threw", e);
    }
  }

  return NextResponse.json({ ok: true, stored: true });
}
