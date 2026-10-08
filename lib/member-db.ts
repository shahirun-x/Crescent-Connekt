import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MEMBER_COOKIE } from "./connect-auth";

/**
 * A Supabase client that acts AS the signed-in member, plus their verified id.
 *
 * Publishable key plus the member's own access token, so every query runs as
 * the `authenticated` role with that member's `auth.uid()` — and Row Level
 * Security decides what comes back, not application code. This is the client
 * for any page that shows OTHER members.
 *
 * Contrast with `getServiceSupabase()` in supabase-server.ts, which bypasses
 * RLS entirely. That client must never be used to read other members on a
 * member-facing page: a missing `.eq("status", "approved")` would then leak
 * pending, rejected and suspended profiles. With this client the same mistake
 * returns nothing extra, because the profiles SELECT policy only exposes
 * approved rows to approved callers (migration-connect.sql), and
 * directory_profiles is `security_invoker`, so it inherits that policy
 * (migration-directory-email.sql).
 *
 * The token is verified with the same publishable-key client, so a page built
 * on this helper touches no service-role credential at all.
 *
 * Returns null when there is no member cookie, the token is invalid or
 * expired, or Supabase is not configured. The middleware has already sent
 * anyone in that state to /connect/login, so this is a defensive branch.
 */
export async function getMemberDb(): Promise<{
  db: SupabaseClient;
  userId: string;
} | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const token = (await cookies()).get(MEMBER_COOKIE)?.value;
  if (!token) return null;

  const db = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;

  return { db, userId: data.user.id };
}
