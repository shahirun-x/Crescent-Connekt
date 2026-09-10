"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { apiErrorMessage, authErrorMessage } from "@/lib/auth-errors";
import AuthShell from "@/components/connect/AuthShell";

/**
 * Landing point for Google OAuth and email-verification links.
 *
 * Supabase puts the session in the URL fragment, which never reaches the
 * server — so the exchange happens here in the browser, then the session is
 * posted to /api/connect/session to become an httpOnly cookie.
 */
export default function ConnectCallbackPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = getBrowserSupabase();
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (cancelled) return;

        if (sessionError || !data.session) {
          setError(
            sessionError
              ? authErrorMessage(sessionError, "oauth-callback")
              : "We couldn't complete your sign-in. The link may have expired or already been used — please request a new one."
          );
          return;
        }

        const res = await fetch("/api/connect/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(
            apiErrorMessage(json, "oauth-callback-session", "Could not start your session.")
          );
          return;
        }

        if (!json.hasProfile) router.replace("/connect/setup");
        else if (json.status === "approved") router.replace("/connect/directory");
        else if (json.status === "pending") router.replace("/connect/pending");
        else router.replace("/connect/status");
      } catch (e) {
        if (!cancelled) setError(authErrorMessage(e, "oauth-callback"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <AuthShell
      title={error ? "Sign-in problem" : "Signing you in…"}
      subtitle={error ? undefined : "One moment while we set up your session."}
    >
      {error ? (
        <div>
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
          <a
            href="/connect/login"
            className="mt-4 flex w-full items-center justify-center rounded-full bg-crescent-700 px-6 py-3 text-sm font-semibold text-white hover:bg-crescent-800"
          >
            Back to sign in
          </a>
        </div>
      ) : (
        <div className="flex justify-center py-6">
          <span className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-crescent-200 border-t-crescent-700" />
        </div>
      )}
    </AuthShell>
  );
}
