import { cookies } from "next/headers";
import { getServiceSupabase } from "./supabase-server";
import type { MemberRole, MemberStatus } from "./roles";

/**
 * Crescent Connect member sessions.
 *
 * Members use their own cookie namespace (`cg-member-token`), completely
 * separate from the admin `sb-access-token`. The two surfaces share one
 * Supabase Auth project but never share a session: signing into Connect
 * grants no admin access, and vice versa.
 */
export const MEMBER_COOKIE = "cg-member-token";
export const MEMBER_REFRESH_COOKIE = "cg-member-refresh";

export interface MemberUser {
  id: string;
  email: string;
}

export interface MemberProfile {
  id: string;
  full_name: string;
  role: MemberRole;
  institution_id: string | null;
  batch_year: number | null;
  current_city: string | null;
  current_country: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  status: MemberStatus;
  rejection_reason: string | null;
  show_email: boolean;
  show_phone: boolean;
  phone: string | null;
  created_at: string;
}

/** The signed-in member's auth user, or null. */
export async function getMemberUser(): Promise<MemberUser | null> {
  const store = await cookies();
  const token = store.get(MEMBER_COOKIE)?.value;
  if (!token) return null;

  const supabase = getServiceSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? "" };
}

/** The signed-in member's profile row, or null if they haven't created one. */
export async function getMemberProfile(
  userId: string
): Promise<MemberProfile | null> {
  const supabase = getServiceSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as MemberProfile;
}

/** Convenience: the user plus their profile in one call. */
export async function getMemberSession(): Promise<{
  user: MemberUser;
  profile: MemberProfile | null;
} | null> {
  const user = await getMemberUser();
  if (!user) return null;
  return { user, profile: await getMemberProfile(user.id) };
}

/** Where a member belongs right now, given their profile status. */
export function routeForProfile(profile: MemberProfile | null): string {
  if (!profile) return "/connect/setup";
  switch (profile.status) {
    case "approved":
      return "/connect/directory";
    case "pending":
      return "/connect/pending";
    default:
      return "/connect/status";
  }
}
