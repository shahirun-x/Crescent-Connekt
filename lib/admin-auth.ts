import { cookies } from "next/headers";
import { getServiceSupabase } from "./supabase-server";

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * Check if the current request is from an authenticated admin.
 *
 * SECURITY: it is not enough that the token belongs to a valid Supabase user.
 * Crescent Connect gives every member a real auth.users account, so "is this a
 * valid user?" would let any member reach the admin dashboard by moving their
 * token into the admin cookie. Administrator is therefore an explicit grant,
 * recorded in public.admins (see supabase/migration-connect.sql), and is
 * checked here on every request.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  if (!accessToken) return null;

  const supabase = getServiceSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;

  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError) {
    console.error("[admin-auth] admins lookup failed", adminError.message);
    return null;
  }
  if (!adminRow) return null;

  return {
    id: data.user.id,
    email: data.user.email ?? "",
  };
}
