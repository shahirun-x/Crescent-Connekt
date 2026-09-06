"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import AuthShell from "@/components/connect/AuthShell";
import GoogleButton from "@/components/connect/GoogleButton";

export default function ConnectLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = getBrowserSupabase();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.session) {
        setError(authError?.message ?? "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Hand the session to the server, which sets httpOnly member cookies
      // and tells us where this member belongs.
      const res = await fetch("/api/connect/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Could not start your session.");
        setLoading(false);
        return;
      }

      if (!json.hasProfile) router.push("/connect/setup");
      else if (json.status === "approved") router.push("/connect/directory");
      else if (json.status === "pending") router.push("/connect/pending");
      else router.push("/connect/status");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back to the Crescent network."
      footer={
        <>
          New here?{" "}
          <Link
            href="/connect/signup"
            className="font-semibold text-crescent-700 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <GoogleButton onError={setError} />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs uppercase tracking-wider text-slate-500">or</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

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
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
          />
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
            "Sign in"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
