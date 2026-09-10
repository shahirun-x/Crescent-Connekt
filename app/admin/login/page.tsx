"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { authErrorMessage } from "@/lib/auth-errors";

export default function AdminLoginPage() {
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
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError || !data.session) {
        setError(
          authError
            ? authErrorMessage(authError, "admin-login")
            : "That email and password don't match. Please check both and try again."
        );
        setLoading(false);
        return;
      }

      // Set the access token as a cookie for middleware verification
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      router.push("/admin");
    } catch (e) {
      setError(authErrorMessage(e, "admin-login"));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-center text-xl font-bold text-crescent-800">
            Admin Login
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Crescent Global Dashboard
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 block w-full rounded-lg border border-control px-3 py-2 text-sm shadow-sm focus:border-crescent-500 focus:outline-none focus:ring-2 focus:ring-crescent-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 block w-full rounded-lg border border-control px-3 py-2 text-sm shadow-sm focus:border-crescent-500 focus:outline-none focus:ring-2 focus:ring-crescent-500/20"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-crescent-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crescent-800 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-600">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
