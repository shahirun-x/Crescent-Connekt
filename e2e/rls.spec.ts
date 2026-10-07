import { test, expect } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  hasTestDb,
  NO_DB_REASON,
  assertNotProduction,
  serviceClient,
  TEST_SUPABASE_URL,
  TEST_SUPABASE_ANON_KEY,
} from "./fixtures/supabase";
import { createMember, deleteMember, type TestMember } from "./fixtures/members";
import { createAdmin, deleteAdmin, type TestAdmin } from "./fixtures/admin";

/**
 * Database policies must check is_admin(), never just authentication
 * (DECISIONS #31, supabase/migration-admin-rls.sql).
 *
 * Before that migration, any confirmed member could write events, read every
 * contact submission and overwrite any image, because the policies only asked
 * "is this a signed-in user?". The app's own routes never noticed — they use
 * the service role — so these tests talk to Supabase directly with the
 * member's session. That is the path an attacker takes.
 *
 * Each denial has a positive control (the member's own avatar folder, an
 * admin's write) so a policy that denies EVERYTHING cannot pass as a fix.
 */

// 1×1 transparent PNG — a real image, so the bucket's MIME check is not what
// rejects the upload.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

/** A fresh client per user — never the shared anonClient(), whose session is global. */
async function signedInClient(email: string, password: string): Promise<SupabaseClient> {
  const sb = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in failed: ${error.message}`);
  return sb;
}

function testEventRow(id: string) {
  return {
    id,
    title: "E2E RLS probe",
    date_start: "2030-01-01",
    category: "Community",
    location: "",
    description: "",
  };
}

test.describe("RLS: an approved member is not an admin", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  let member: TestMember;
  let sb: SupabaseClient;

  test.beforeEach(async () => {
    // Approved, not pending — the most-privileged member there is.
    member = await createMember({ status: "approved", emailPrefix: "rls" });
    sb = await signedInClient(member.email, member.password);
  });

  test.afterEach(async () => {
    await sb?.auth.signOut().catch(() => {});
    await deleteMember(member).catch(() => {});
  });

  test("cannot insert, update or delete events", async () => {
    const svc = serviceClient();
    const probeId = `e2e-rls-${Date.now().toString(36)}`;
    const existingId = `${probeId}-existing`;
    await svc.from("events").insert(testEventRow(existingId));

    try {
      const ins = await sb.from("events").insert(testEventRow(probeId));
      expect(ins.error, "member insert into events must be refused").toBeTruthy();
      expect(ins.error?.code).toBe("42501");

      // UPDATE and DELETE are filtered by RLS rather than raising: assert on
      // the database state, which is what actually matters.
      await sb.from("events").update({ title: "defaced" }).eq("id", existingId);
      await sb.from("events").delete().eq("id", existingId);

      const { data: after } = await svc
        .from("events")
        .select("id, title")
        .in("id", [probeId, existingId]);
      expect(after?.map((r) => r.id), "probe row must not exist").not.toContain(probeId);
      const existing = after?.find((r) => r.id === existingId);
      expect(existing, "member must not be able to delete an event").toBeTruthy();
      expect(existing?.title, "member must not be able to edit an event").toBe(
        "E2E RLS probe"
      );
    } finally {
      await svc.from("events").delete().in("id", [probeId, existingId]);
    }
  });

  test("cannot read contact submissions or the signup list", async () => {
    const svc = serviceClient();
    const marker = `e2e-rls-${Date.now().toString(36)}@crescent-e2e.test`;
    await svc.from("contacts").insert({ name: "RLS probe", email: marker, message: "private" });
    await svc.from("connect_signups").insert({ email: marker });

    try {
      const contacts = await sb.from("contacts").select("id, email");
      expect(contacts.error).toBeNull();
      expect(contacts.data, "member must see no contact rows").toEqual([]);

      const signups = await sb.from("connect_signups").select("id, email");
      expect(signups.error).toBeNull();
      expect(signups.data, "member must see no signup rows").toEqual([]);
    } finally {
      await svc.from("contacts").delete().eq("email", marker);
      await svc.from("connect_signups").delete().eq("email", marker);
    }
  });

  test("can upload only inside avatars/<own uid>/", async () => {
    const stamp = Date.now();
    const own = `avatars/${member.id}/${stamp}-own.png`;
    const opts = { contentType: "image/png", upsert: false };

    // Positive control first: if this fails, the policy is broken, not tight.
    const ok = await sb.storage.from("media").upload(own, PNG, opts);
    expect(ok.error, "own avatar folder must accept the upload").toBeNull();
    member.avatarPaths.push(own); // removed by deleteMember

    const denied = [
      `events/${stamp}-member.png`, //                       admin-only folder
      `news/${stamp}-member.png`, //                         admin-only folder
      `avatars/${stamp}-flat.png`, //                        old flat avatar path
      `avatars/00000000-0000-0000-0000-000000000000/${stamp}-other.png`, // someone else
    ];
    for (const path of denied) {
      const res = await sb.storage.from("media").upload(path, PNG, opts);
      expect(res.error, `upload to ${path} must be refused`).toBeTruthy();
      if (!res.error) member.avatarPaths.push(path); // still clean up on failure
    }
  });

  test("cannot overwrite or delete another member's avatar", async () => {
    const other = await createMember({ status: "approved", emailPrefix: "rls-other" });
    const path = `avatars/${other.id}/${Date.now()}-theirs.png`;
    other.avatarPaths.push(path);

    try {
      const svc = serviceClient();
      const seeded = await svc.storage
        .from("media")
        .upload(path, PNG, { contentType: "image/png" });
      expect(seeded.error).toBeNull();

      const overwrite = await sb.storage
        .from("media")
        .upload(path, PNG, { contentType: "image/png", upsert: true });
      expect(overwrite.error, "overwrite must be refused").toBeTruthy();

      await sb.storage.from("media").remove([path]);
      const { data: still } = await svc.storage
        .from("media")
        .list(`avatars/${other.id}`);
      expect(still?.length, "the other member's avatar must survive").toBe(1);
    } finally {
      await deleteMember(other).catch(() => {});
    }
  });
});

test.describe("RLS: an admin can still write directly", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  let admin: TestAdmin;

  test.beforeEach(async () => {
    admin = await createAdmin();
  });

  test.afterEach(async () => {
    await deleteAdmin(admin).catch(() => {});
  });

  // Positive control for the whole suite: is_admin() must actually grant.
  test("admin session can insert an event and upload a cover", async () => {
    const sb = await signedInClient(admin.email, admin.password);
    const svc = serviceClient();
    const id = `e2e-rls-admin-${Date.now().toString(36)}`;
    const cover = `events/${Date.now()}-e2e-admin.png`;

    try {
      const ins = await sb.from("events").insert(testEventRow(id));
      expect(ins.error, "admin insert must succeed").toBeNull();

      const up = await sb.storage
        .from("media")
        .upload(cover, PNG, { contentType: "image/png" });
      expect(up.error, "admin cover upload must succeed").toBeNull();

      const contacts = await sb.from("contacts").select("id").limit(1);
      expect(contacts.error, "admin can read contacts").toBeNull();
    } finally {
      await svc.from("events").delete().eq("id", id);
      await svc.storage.from("media").remove([cover]).catch(() => {});
      await sb.auth.signOut().catch(() => {});
    }
  });
});
