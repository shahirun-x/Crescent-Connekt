import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str: string): string {
  return str.replace(/[<>]/g, "").trim();
}

export async function POST(request: Request) {
  let body: { name?: string; email?: string; role?: string };
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
  const role = sanitize(body.role ?? "");

  // Validate before consuming a rate-limit slot, so typos don't lock anyone out.
  if (!emailRe.test(email)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please enter a valid email address.",
        fieldErrors: { email: "Please enter a valid email address." },
      },
      { status: 422 }
    );
  }

  const ip = getClientIP(request);
  const rl = checkRateLimit(`subscribe:${ip}`, 3);
  if (!rl.ok) {
    const mins = Math.max(1, Math.ceil(rl.retryAfterMs / 60000));
    return NextResponse.json(
      {
        ok: false,
        error: `You've signed up a few times already. Please try again in about ${mins} minute${mins === 1 ? "" : "s"}.`,
      },
      { status: 429 }
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.error(
      "[subscribe] Supabase is not configured — NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing at runtime."
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          "Sign-ups are temporarily unavailable. Please try again shortly.",
      },
      { status: 503 }
    );
  }

  // NOTE: we do NOT pre-check for an existing row. Anonymous visitors have
  // INSERT but no SELECT policy on connect_signups, so a lookup silently
  // returns [] and never detects a duplicate. Instead we let the unique
  // constraint on `email` do the work and translate 23505 into a friendly
  // "already registered" response.
  const { error } = await supabase
    .from("connect_signups")
    .insert({ name: name || null, email, role: role || null });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({
        ok: true,
        stored: true,
        message: "You're already on the list — we'll be in touch.",
      });
    }

    console.error("[subscribe] Supabase insert failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      {
        ok: false,
        error: `We couldn't add you right now (${error.message}). Please try again later.`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, stored: true });
}
