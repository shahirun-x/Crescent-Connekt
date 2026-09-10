import type { BrowserContext, Page } from "@playwright/test";
import { serviceClient, TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY } from "./supabase";
import { createClient } from "@supabase/supabase-js";

/**
 * Test member lifecycle.
 *
 * Every test that needs a member creates its own with a unique email and
 * deletes it afterwards. Nothing here assumes a clean database, and nothing is
 * left behind — including the avatar, which lives in Storage rather than in a
 * table and is the easy thing to forget.
 */

export type MemberStatus = "pending" | "approved" | "rejected" | "suspended";

export interface TestMember {
  id: string;
  email: string;
  password: string;
  fullName: string;
  /** Storage object paths to remove on teardown. */
  avatarPaths: string[];
}

const registry: TestMember[] = [];

/** Unique per call — timestamp plus randomness, since tests can run in the same ms. */
export function uniqueEmail(prefix = "e2e"): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}+${stamp}${rand}@crescent-e2e.test`;
}

export const TEST_PASSWORD = "e2e-Test-Passw0rd!";

/**
 * Create a member directly, skipping the UI.
 *
 * Tests that are not ABOUT signup should not have to walk three wizard steps to
 * get a fixture. `status` is written with the service role, which is the only
 * thing allowed to set it (the trigger in migration-connect.sql blocks members
 * from touching their own).
 */
export async function createMember(opts: {
  status?: MemberStatus;
  fullName?: string;
  showEmail?: boolean;
  showPhone?: boolean;
  phone?: string | null;
  headline?: string | null;
  role?: string;
  emailPrefix?: string;
}): Promise<TestMember> {
  const sb = serviceClient();
  const email = uniqueEmail(opts.emailPrefix);
  const fullName = opts.fullName ?? `E2E Member ${Date.now().toString(36)}`;

  const { data: created, error: authErr } = await sb.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true, // skip the verification round trip
  });
  if (authErr || !created.user) {
    throw new Error(`createMember: auth user failed — ${authErr?.message}`);
  }

  const member: TestMember = {
    id: created.user.id,
    email,
    password: TEST_PASSWORD,
    fullName,
    avatarPaths: [],
  };
  registry.push(member);

  if (opts.status) {
    const { error: profErr } = await sb.from("profiles").insert({
      id: member.id,
      full_name: fullName,
      role: opts.role ?? "alumni",
      headline: opts.headline ?? "E2E fixture member",
      current_city: "Chennai",
      current_country: "India",
      phone: opts.phone ?? null,
      show_email: opts.showEmail ?? false,
      show_phone: opts.showPhone ?? false,
      status: opts.status,
    });
    if (profErr) {
      throw new Error(`createMember: profile insert failed — ${profErr.message}`);
    }
  }

  return member;
}

/** Flip a consent flag with the service role, as the admin/API would. */
export async function setProfileFlags(
  id: string,
  flags: Partial<{ show_email: boolean; show_phone: boolean; phone: string | null }>
) {
  const { error } = await serviceClient().from("profiles").update(flags).eq("id", id);
  if (error) throw new Error(`setProfileFlags: ${error.message}`);
}

/** Change status the way the admin route does. */
export async function setStatus(id: string, status: MemberStatus) {
  const { error } = await serviceClient()
    .from("profiles")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(`setStatus: ${error.message}`);
}

/**
 * Delete a member and everything attached to it.
 *
 * The profile row cascades from auth.users (ON DELETE CASCADE), but Storage
 * objects do not — those are removed explicitly.
 */
export async function deleteMember(member: TestMember) {
  const sb = serviceClient();

  if (member.avatarPaths.length) {
    await sb.storage.from("media").remove(member.avatarPaths).catch(() => {});
  }
  // Explicit, even though the FK cascades — if the cascade is ever changed the
  // teardown should still leave nothing behind.
  await sb.from("profiles").delete().eq("id", member.id);
  await sb.auth.admin.deleteUser(member.id).catch(() => {});

  const i = registry.indexOf(member);
  if (i >= 0) registry.splice(i, 1);
}

/** Safety net: remove anything a failing test forgot. */
export async function deleteAllTestMembers() {
  for (const m of [...registry]) {
    await deleteMember(m).catch(() => {});
  }
}

/**
 * Sign a member in and install the httpOnly cookies the app uses, without
 * driving the login form.
 *
 * Mirrors what /api/connect/session does: authenticate with the anon client,
 * then POST the tokens so the server sets `cg-member-token`. Going through the
 * real endpoint rather than forging a cookie means the test exercises the same
 * path production does.
 */
export async function signInMember(
  context: BrowserContext,
  baseURL: string,
  member: TestMember
): Promise<{ accessToken: string; refreshToken: string }> {
  const sb = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await sb.auth.signInWithPassword({
    email: member.email,
    password: member.password,
  });
  if (error || !data.session) {
    throw new Error(`signInMember: ${error?.message ?? "no session"}`);
  }

  const res = await context.request.post(`${baseURL}/api/connect/session`, {
    data: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
  if (!res.ok()) {
    throw new Error(`signInMember: session endpoint ${res.status()}`);
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

/** Clear member cookies without touching admin ones. */
export async function signOutMember(context: BrowserContext, baseURL: string) {
  await context.request.delete(`${baseURL}/api/connect/session`);
}

/** Collect storage paths an upload created, so teardown can remove them. */
export async function recordAvatarFromPage(page: Page, member: TestMember) {
  const src = await page
    .locator('img[alt=""]')
    .first()
    .getAttribute("src")
    .catch(() => null);
  if (src && src.includes("/storage/v1/object/public/media/")) {
    const path = src.split("/storage/v1/object/public/media/")[1]?.split("?")[0];
    if (path) member.avatarPaths.push(decodeURIComponent(path));
  }
}
