import type { BrowserContext } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  serviceClient,
  TEST_SUPABASE_URL,
  TEST_SUPABASE_ANON_KEY,
} from "./supabase";
import { uniqueEmail, TEST_PASSWORD } from "./members";

/**
 * Test admin lifecycle.
 *
 * An admin is an auth user PLUS a row in public.admins — that separation is the
 * whole point of DECISIONS #15, and the fixture reflects it rather than
 * shortcutting it. `createNonAdminAuthUser` deliberately creates a user WITHOUT
 * that row, so the privilege-escalation regression test has something real to
 * fail with.
 */

export interface TestAdmin {
  id: string;
  email: string;
  password: string;
}

const registry: TestAdmin[] = [];

export async function createAdmin(): Promise<TestAdmin> {
  const sb = serviceClient();
  const email = uniqueEmail("e2e-admin");

  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`createAdmin: ${error?.message}`);
  }

  const { error: grantErr } = await sb
    .from("admins")
    .insert({ user_id: data.user.id, note: "e2e fixture" });
  if (grantErr) {
    throw new Error(`createAdmin: admins insert failed — ${grantErr.message}`);
  }

  const admin: TestAdmin = { id: data.user.id, email, password: TEST_PASSWORD };
  registry.push(admin);
  return admin;
}

export async function deleteAdmin(admin: TestAdmin) {
  const sb = serviceClient();
  await sb.from("admins").delete().eq("user_id", admin.id);
  await sb.auth.admin.deleteUser(admin.id).catch(() => {});
  const i = registry.indexOf(admin);
  if (i >= 0) registry.splice(i, 1);
}

export async function deleteAllTestAdmins() {
  for (const a of [...registry]) await deleteAdmin(a).catch(() => {});
}

/**
 * Sign in as admin by setting the `sb-access-token` cookie the middleware
 * reads. The admin login page sets this client-side with document.cookie, so
 * the cookie is intentionally NOT httpOnly and can be set here directly.
 */
export async function signInAdmin(
  context: BrowserContext,
  baseURL: string,
  admin: TestAdmin
): Promise<string> {
  const sb = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await sb.auth.signInWithPassword({
    email: admin.email,
    password: admin.password,
  });
  if (error || !data.session) {
    throw new Error(`signInAdmin: ${error?.message ?? "no session"}`);
  }

  await setAdminCookie(context, baseURL, data.session.access_token);
  return data.session.access_token;
}

/** Set the admin cookie to an arbitrary token — used by the escalation test. */
export async function setAdminCookie(
  context: BrowserContext,
  baseURL: string,
  token: string
) {
  const url = new URL(baseURL);
  await context.addCookies([
    {
      name: "sb-access-token",
      value: token,
      domain: url.hostname,
      path: "/",
      httpOnly: false,
      secure: url.protocol === "https:",
      sameSite: "Lax",
    },
  ]);
}

/**
 * An auth user with NO admins row. Represents any Crescent Connect member:
 * a real, valid Supabase session that must not be admin.
 */
export async function createNonAdminAuthUser(): Promise<TestAdmin> {
  const sb = serviceClient();
  const email = uniqueEmail("e2e-notadmin");
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`createNonAdminAuthUser: ${error?.message}`);

  const user: TestAdmin = { id: data.user.id, email, password: TEST_PASSWORD };
  registry.push(user); // registered so teardown removes it either way
  return user;
}
