"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import AuthShell from "@/components/connect/AuthShell";
import { AUTH_FALLBACK, apiErrorMessage, authErrorMessage } from "@/lib/auth-errors";

const MIN_PASSWORD = 8;

/**
 * "invalid" means the link itself is no good. "unavailable" means we could
 * not reach Supabase at all — telling that user their link expired would send
 * them round a loop requesting new ones that also fail.
 */
type Phase = "checking" | "ready" | "invalid" | "unavailable";

/**
 * Choose a new password, arriving from the emailed recovery link.
 *
 * HOW THE TOKEN GETS HERE: Supabase puts the recovery token in the URL
 * FRAGMENT (#access_token=...), which never reaches the server — so this has
 * to be a client component, and the check has to run after mount. The browser
 * client has detectSessionInUrl on by default, so supabase-js consumes the
 * fragment and establishes a recovery session before we look.
 *
 * That session is what authorises updateUser(). If there is no session by the
 * time we check, the link was expired, already used, or tampered with, and we
 * say so rather than showing a password form that cannot possibly work.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: (() => void) | undefined;

    try {
      const supabase = getBrowserSupabase();

      // A PASSWORD_RECOVERY event may land before or after our getSession call
      // depending on how fast the fragment is parsed, so listen as well as
      // poll — whichever resolves first flips us to "ready".
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (cancelled) return;
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          setPhase("ready");
        }
      });
      unsubscribe = () => sub.subscription.unsubscribe();

      supabase.auth.getSession().then(({ data }) => {
        if (!cancelled && data.session) setPhase("ready");
      });

      // Give the fragment a beat to be consumed before declaring failure.
      timer = setTimeout(async () => {
        if (cancelled) return;
        const { data: retry } = await supabase.auth.getSession();
        if (cancelled) return;
        setPhase(retry.session ? "ready" : "invalid");
      }, 1200);
    } catch (e) {
      setError(authErrorMessage(e, "reset-password-init"));
      setPhase("unavailable");
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Validate before doing anything — a mismatch should not cost a round trip.
    if (password.length < MIN_PASSWORD) {
      setError(`Please choose a password of at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Those two passwords don't match. Please retype them.");
      return;
    }

    setSaving(true);
    try {
      const supabase = getBrowserSupabase();
      const { data, error: authError } = await supabase.auth.updateUser({
        password,
      });

      if (authError) {
        setError(authErrorMessage(authError, "reset-password"));
        setSaving(false);
        return;
      }
      if (!data.user) {
        setError(
          "We couldn't update your password. The reset link may have expired — please request a new one."
        );
        setSaving(false);
        return;
      }

      // Hand the now-authenticated session to the server so the member gets
      // the same httpOnly cookies login issues, then route by profile status
      // exactly as the login page does.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        // Password changed but no usable session — send them to sign in with it.
        router.push("/connect/login");
        return;
      }

      const res = await fetch("/api/connect/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(
          apiErrorMessage(
            json,
            "reset-password-session",
            "Your password was changed, but we couldn't sign you in. Please sign in with your new password."
          )
        );
        setSaving(false);
        return;
      }

      if (!json.hasProfile) router.push("/connect/setup");
      else if (json.status === "approved") router.push("/connect/directory");
      else if (json.status === "pending") router.push("/connect/pending");
      else router.push("/connect/status");
      router.refresh();
    } catch (e) {
      setError(authErrorMessage(e, "reset-password"));
      setSaving(false);
    }
  }

  if (phase === "checking") {
    return (
      <AuthShell title="Checking your link…">
        <div className="flex justify-center py-6">
          <span
            role="status"
            aria-label="Checking your reset link"
            className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-crescent-200 border-t-crescent-700"
          />
        </div>
      </AuthShell>
    );
  }

  if (phase === "unavailable") {
    return (
      <AuthShell
        title="We can't check that link right now"
        subtitle="This is a problem on our side, not with your link."
      >
        <div
          className="rounded-lg bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
          role="alert"
        >
          {error || AUTH_FALLBACK}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Your reset link is probably still fine — try it again shortly before
          requesting a new one.
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

  if (phase === "invalid") {
    return (
      <AuthShell
        title="This link has expired"
        subtitle="Reset links can only be used once, and they expire after a short time."
      >
        <div
          className="rounded-lg bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
          role="alert"
        >
          {error ||
            "That link is no longer valid. Request a new one and we'll email it straight away."}
        </div>

        <Link
          href="/connect/forgot-password"
          className="mt-6 flex w-full items-center justify-center rounded-full bg-crescent-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crescent-800"
        >
          Request a new link
        </Link>
        <Link
          href="/connect/login"
          className="mt-3 flex w-full items-center justify-center rounded-full border border-crescent-300 px-6 py-3 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50"
        >
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something you don't use anywhere else."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD}
            autoComplete="new-password"
            autoFocus
            aria-describedby="reset-password-hint"
            className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
          />
          <span
            id="reset-password-hint"
            className="mt-1 block text-xs font-normal text-slate-500"
          >
            At least {MIN_PASSWORD} characters.
          </span>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Confirm new password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            aria-invalid={!!error}
            aria-describedby={error ? "reset-error" : undefined}
            className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
          />
        </label>

        {error && (
          <p
            id="reset-error"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center rounded-full bg-crescent-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crescent-800 disabled:opacity-60"
        >
          {saving ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            "Save new password"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
