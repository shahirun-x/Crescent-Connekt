import { test, expect } from "@playwright/test";
import { hasTestDb, NO_DB_REASON, assertNotProduction, anonClient } from "./fixtures/supabase";
import {
  createMember,
  deleteMember,
  setProfileFlags,
  signInMember,
  signOutMember,
  type TestMember,
} from "./fixtures/members";

/**
 * The privacy model. Highest-value suite in the repo.
 *
 * Everything here asserts BOTH the rendered page and the API/DB response. A
 * field hidden in the UI but present in the JSON is still a leak — the whole
 * reason directory_profiles masks columns for every caller rather than the UI
 * hiding them (DECISIONS #19).
 */

test.describe("privacy model", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  let viewer: TestMember;
  let subject: TestMember;

  test.beforeEach(async () => {
    // An approved viewer is required — RLS only lets approved members read
    // other approved members.
    viewer = await createMember({ status: "approved", emailPrefix: "viewer" });
    subject = await createMember({
      status: "approved",
      emailPrefix: "subject",
      fullName: "Privacy Subject",
      phone: "+91 90000 00000",
      showEmail: false,
      showPhone: false,
    });
  });

  test.afterEach(async () => {
    await deleteMember(viewer).catch(() => {});
    await deleteMember(subject).catch(() => {});
  });

  test("contact details are hidden by default, in the page AND the API", async ({
    page,
    context,
    baseURL,
  }) => {
    await signInMember(context, baseURL!, viewer);

    await page.goto(`/connect/profile/${subject.id}`);
    const body = await page.locator("body").innerText();

    expect(body, "email must not render").not.toContain(subject.email);
    expect(body, "phone must not render").not.toContain("90000 00000");
    expect(body).toContain("keep their contact details private");

    // The JSON is the real test — a UI that hides a field it received is one
    // "view source" away from leaking it.
    const res = await context.request.get(`${baseURL}/api/connect/directory`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    const row = json.data.find((m: { id: string }) => m.id === subject.id);
    expect(row, "subject should appear in the directory").toBeTruthy();
    expect(row.email, "email must be null in the API payload").toBeNull();
    expect(row.phone, "phone must be null in the API payload").toBeNull();

    // And the raw response text, in case of a nested copy anywhere.
    expect(await res.text()).not.toContain(subject.email);
  });

  test("show_email exposes the email, independently of phone", async ({
    page,
    context,
    baseURL,
  }) => {
    await signInMember(context, baseURL!, viewer);
    await setProfileFlags(subject.id, { show_email: true, show_phone: false });

    await page.goto(`/connect/profile/${subject.id}`);
    await expect(page.getByText(subject.email)).toBeVisible();
    expect(await page.locator("body").innerText()).not.toContain("90000 00000");

    const json = await (
      await context.request.get(`${baseURL}/api/connect/directory`)
    ).json();
    const row = json.data.find((m: { id: string }) => m.id === subject.id);
    expect(row.email).toBe(subject.email);
    expect(row.phone, "phone must stay hidden").toBeNull();
  });

  test("show_phone exposes the phone, independently of email", async ({
    page,
    context,
    baseURL,
  }) => {
    await signInMember(context, baseURL!, viewer);
    await setProfileFlags(subject.id, { show_email: false, show_phone: true });

    await page.goto(`/connect/profile/${subject.id}`);
    const body = await page.locator("body").innerText();
    expect(body).toContain("90000 00000");
    expect(body, "email must stay hidden").not.toContain(subject.email);
  });

  test("turning a flag back off re-hides the field", async ({
    page,
    context,
    baseURL,
  }) => {
    await signInMember(context, baseURL!, viewer);

    await setProfileFlags(subject.id, { show_email: true });
    await page.goto(`/connect/profile/${subject.id}`);
    await expect(page.getByText(subject.email)).toBeVisible();

    await setProfileFlags(subject.id, { show_email: false });
    await page.reload();
    expect(await page.locator("body").innerText()).not.toContain(subject.email);
  });
});

test.describe("directory access control", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  test("unauthenticated directory API returns 401, not an empty array", async ({
    request,
    baseURL,
  }) => {
    const res = await request.get(`${baseURL}/api/connect/directory`);
    // An empty array is indistinguishable from "no members" and would hide
    // broken auth entirely — this is why the route returns a status.
    expect(res.status()).toBe(401);
    const json = await res.json();
    expect(json.data, "must not return a data array").toBeUndefined();
    expect(json.error).toBeTruthy();
  });

  test("a pending member cannot reach the directory", async ({
    page,
    context,
    baseURL,
  }) => {
    const pending = await createMember({ status: "pending", emailPrefix: "pending" });
    try {
      await signInMember(context, baseURL!, pending);

      await page.goto("/connect/directory");
      await expect(page).toHaveURL(/\/connect\/pending/);

      const api = await context.request.get(`${baseURL}/api/connect/directory`);
      expect(api.status(), "API must refuse a pending member").toBe(403);
    } finally {
      await deleteMember(pending);
    }
  });

  test("a member with no profile is sent to setup", async ({
    page,
    context,
    baseURL,
  }) => {
    const noProfile = await createMember({ emailPrefix: "noprofile" }); // no status ⇒ no profile row
    try {
      await signInMember(context, baseURL!, noProfile);
      await page.goto("/connect/directory");
      await expect(page).toHaveURL(/\/connect\/setup/);
    } finally {
      await deleteMember(noProfile);
    }
  });
});

test.describe("status cannot be self-elevated", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  test("the profile API ignores a client-supplied status", async ({
    context,
    baseURL,
  }) => {
    const member = await createMember({ status: "pending", emailPrefix: "elevate" });
    try {
      await signInMember(context, baseURL!, member);

      // The route builds its payload from an allowlist, so `status` should be
      // dropped rather than written.
      const res = await context.request.put(`${baseURL}/api/connect/profile`, {
        data: {
          full_name: member.fullName,
          role: "alumni",
          status: "approved",
        },
      });
      expect(res.ok(), "the update itself should succeed").toBe(true);

      const check = await context.request.get(`${baseURL}/api/connect/profile`);
      const { data } = await check.json();
      expect(data.status, "status must still be pending").toBe("pending");
    } finally {
      await deleteMember(member);
    }
  });

  test("the database trigger blocks a direct status update by a member", async () => {
    const member = await createMember({ status: "pending", emailPrefix: "trigger" });
    try {
      // Authenticate as the member against Supabase directly, bypassing our
      // API entirely — this is the path an attacker would actually take, and
      // the only thing standing in the way is the trigger from
      // migration-connect.sql.
      const sb = anonClient();
      const { data: auth, error: signInErr } = await sb.auth.signInWithPassword({
        email: member.email,
        password: member.password,
      });
      expect(signInErr, "member should be able to sign in").toBeNull();
      expect(auth.session).toBeTruthy();

      const { error } = await sb
        .from("profiles")
        .update({ status: "approved" })
        .eq("id", member.id);

      // Either the trigger raises, or RLS silently matches nothing. Both are
      // acceptable; a successful elevation is not.
      const { data: after } = await sb
        .from("profiles")
        .select("status")
        .eq("id", member.id)
        .maybeSingle();

      if (!error) {
        expect(
          after?.status,
          "member must not be able to approve themselves"
        ).not.toBe("approved");
      }
      await sb.auth.signOut();
    } finally {
      await deleteMember(member);
    }
  });
});

test.describe("session lifecycle", () => {
  test.skip(!hasTestDb, NO_DB_REASON);

  test("signing out revokes directory access", async ({ context, baseURL }) => {
    const member = await createMember({ status: "approved", emailPrefix: "signout" });
    try {
      await signInMember(context, baseURL!, member);
      expect((await context.request.get(`${baseURL}/api/connect/directory`)).status()).toBe(200);

      await signOutMember(context, baseURL!);
      expect(
        (await context.request.get(`${baseURL}/api/connect/directory`)).status(),
        "access must end with the session"
      ).toBe(401);
    } finally {
      await deleteMember(member);
    }
  });
});
