"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import AuthShell from "@/components/connect/AuthShell";
import GoogleButton from "@/components/connect/GoogleButton";
import {
  GOOGLE_AUTH_ENABLED,
  apiErrorMessage,
  authErrorMessage,
} from "@/lib/auth-errors";

export default function ConnectSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Please choose a password of at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Server-side signup throttle (5 per IP per hour).
      const guard = await fetch("/api/connect/signup-guard", { method: "POST" });
      if (!guard.ok) {
        const g = await guard.json().catch(() => ({}));
        setError(
          apiErrorMessage(
            g,
            "signup-guard",
            "Too many sign-up attempts. Please try again later."
          )
        );
        setLoading(false);
        return;
      }

      const supabase = getBrowserSupabase();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/connect/callback`,
        },
      });

      if (authError) {
        setError(authErrorMessage(authError, "member-signup"));
        setLoading(false);
        return;
      }

      // With email confirmation on, Supabase returns a user but no session.
      if (!data.session) {
        setCheckEmail(true);
        setLoading(false);
        return;
      }

      await fetch("/api/connect/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });
      router.push("/connect/setup");
      router.refresh();
    } catch (e) {
      setError(authErrorMessage(e, "member-signup"));
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We've sent a confirmation link to verify your address."
      >
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-semibold">Almost there.</p>
          <p className="mt-1 leading-relaxed">
            Open the link we sent to <strong>{email}</strong> to verify your
            email. You&apos;ll then be asked to set up your member profile.
          </p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Didn&apos;t get it? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => setCheckEmail(false)}
            className="font-semibold text-crescent-700 hover:underline"
          >
            try a different address
          </button>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Join Crescent Connect"
      subtitle="Create your account, then tell us a little about yourself. Profiles are reviewed before joining the directory."
      footer={
        <>
          Already a member?{" "}
          <Link
            href="/connect/login"
            className="font-semibold text-crescent-700 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {/* Button and divider gated together — see the login page. */}
      {GOOGLE_AUTH_ENABLED && (
        <>
          <GoogleButton label="Sign up with Google" onError={setError} />
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs uppercase tracking-wider text-slate-500">
              or
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            At least 8 characters.
          </span>
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
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
            "Create account"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
