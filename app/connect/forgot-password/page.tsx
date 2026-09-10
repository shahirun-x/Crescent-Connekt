"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import AuthShell from "@/components/connect/AuthShell";
import { apiErrorMessage, authErrorMessage, logAuthError } from "@/lib/auth-errors";

/**
 * Request a password-reset link.
 *
 * ENUMERATION: the confirmation below is shown for every well-formed address,
 * whether or not an account exists. Supabase's resetPasswordForEmail is
 * deliberately quiet for the same reason, and we must not undo that by
 * reporting its outcome differently. A form that says "no account with that
 * email" hands an attacker a membership oracle — and for an alumni directory,
 * the membership list is the asset worth protecting.
 *
 * Errors from Supabase are therefore logged but NOT surfaced, with two
 * exceptions that say nothing about the address: our own rate limiter, and a
 * malformed email, both of which are decided before the call is made.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validated and throttled server-side before we touch Supabase.
      const guard = await fetch("/api/connect/reset-guard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!guard.ok) {
        const g = await guard.json().catch(() => ({}));
        setError(
          apiErrorMessage(g, "reset-guard", "Could not send the reset link.")
        );
        setLoading(false);
        return;
      }

      const supabase = getBrowserSupabase();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/connect/reset-password` }
      );

      // Logged for debugging, never shown — see the enumeration note above.
      if (authError) logAuthError("forgot-password", authError);

      setSent(true);
      setLoading(false);
    } catch (e) {
      setError(authErrorMessage(e, "forgot-password"));
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="If that address has a Crescent Connect account, a reset link is on its way."
      >
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-semibold">Reset link sent</p>
          <p className="mt-1 leading-relaxed">
            We&apos;ve sent a link to <strong>{email}</strong> if an account
            exists for it. Open the link to choose a new password — it expires
            after a short time and can only be used once.
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Nothing arrived? Check your spam folder first. If the address has no
          account, no email is sent —{" "}
          <Link
            href="/connect/signup"
            className="font-semibold text-crescent-700 hover:underline"
          >
            create one instead
          </Link>
          .
        </p>

        <Link
          href="/connect/login"
          className="mt-6 flex w-full items-center justify-center rounded-full border border-crescent-300 px-6 py-3 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50"
        >
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email address on your account and we'll send you a link to choose a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/connect/login"
            className="font-semibold text-crescent-700 hover:underline"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
            aria-invalid={!!error}
            aria-describedby={error ? "forgot-error" : undefined}
            className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
          />
        </label>

        {error && (
          <p
            id="forgot-error"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-full bg-crescent-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crescent-800 disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
