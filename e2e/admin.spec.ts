import { test, expect } from "@playwright/test";
import { hasTestDb, NO_DB_REASON, assertNotProduction, serviceClient } from "./fixtures/supabase";
import {
  createAdmin,
  deleteAdmin,
  signInAdmin,
  setAdminCookie,
  createNonAdminAuthUser,
  type TestAdmin,
} from "./fixtures/admin";
import { createMember, deleteMember, signInMember, type TestMember } from "./fixtures/members";
import { createClient } from "@supabase/supabase-js";
import { TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY } from "./fixtures/supabase";

test.describe("admin auth", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  test("unauthenticated /admin/* redirects to login", async ({ page }) => {
    for (const path of ["/admin", "/admin/events", "/admin/members", "/admin/contacts"]) {
      await page.goto(path);
      await expect(page, `${path} should redirect`).toHaveURL(/\/admin\/login/);
    }
  });

  /**
   * THE PRIVILEGE ESCALATION REGRESSION.
   *
   * Before public member signup, every auth.users row was an administrator, so
   * /admin only checked "is this a valid Supabase session?". Connect broke that
   * assumption: every member holds a valid token, and pasting it into the
   * sb-access-token cookie would have granted full admin. public.admins exists
   * to close that hole (DECISIONS #15, SECURITY.md).
   *
   * This test is the guard. If it ever passes into /admin, the admins-table
   * check has been removed or bypassed and members can edit every institution.
   */
  test("a valid non-admin token does NOT grant admin access", async ({
    page,
    context,
    baseURL,
  }) => {
    const user = await createNonAdminAuthUser();
    try {
      const sb = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });
      const { data, error } = await sb.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });
      expect(error, "the token itself must be genuinely valid").toBeNull();
      expect(data.session, "this is a real Supabase session").toBeTruthy();

      // Plant that real token in the admin cookie — the exact attack.
      await setAdminCookie(context, baseURL!, data.session!.access_token);

      await page.goto("/admin");
      await expect(
        page,
        "a member token must never reach the admin dashboard"
      ).toHaveURL(/\/admin\/login/);

      // And the API, which middleware does not protect on its own.
      for (const api of [
        "/api/admin/members",
        "/api/admin/events",
        "/api/admin/institutions",
      ]) {
        const res = await context.request.get(`${baseURL}${api}`);
        expect(res.status(), `${api} must reject a non-admin`).toBe(401);
      }
    } finally {
      await deleteAdmin(user);
    }
  });

  test("a real admin reaches the dashboard", async ({ page, context, baseURL }) => {
    const admin = await createAdmin();
    try {
      await signInAdmin(context, baseURL!, admin);
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/admin$/);
      await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    } finally {
      await deleteAdmin(admin);
    }
  });

  test("revoking the admins row revokes access immediately", async ({
    page,
    context,
    baseURL,
  }) => {
    const admin = await createAdmin();
    try {
      await signInAdmin(context, baseURL!, admin);
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/admin$/);

      // Same cookie, same valid token — only the grant is gone.
      await serviceClient().from("admins").delete().eq("user_id", admin.id);

      await page.goto("/admin/events");
      await expect(
        page,
        "admin is a grant, not a session — removing it must take effect at once"
      ).toHaveURL(/\/admin\/login/);
    } finally {
      await deleteAdmin(admin);
    }
  });
});

test.describe("admin content CRUD", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  let admin: TestAdmin;

  test.beforeEach(async ({ context, baseURL }) => {
    admin = await createAdmin();
    await signInAdmin(context, baseURL!, admin);
  });

  test.afterEach(async () => {
    await deleteAdmin(admin).catch(() => {});
  });

  test("event round trip: create, read, update, delete", async ({ context, baseURL }) => {
    const title = `E2E Event ${Date.now()}`;
    let id: string | undefined;

    try {
      const created = await context.request.post(`${baseURL}/api/admin/events`, {
        data: {
          title,
          date_start: "2027-03-01",
          category: "Community",
          location: "Vandalur",
          description: "Created by the e2e suite.",
          institution_id: null,
          is_featured: false,
        },
      });
      expect(created.status()).toBe(201);
      id = (await created.json()).data.id;
      expect(id).toBeTruthy();

      const list = await (await context.request.get(`${baseURL}/api/admin/events`)).json();
      expect(list.data.some((e: { id: string }) => e.id === id)).toBe(true);

      const updated = await context.request.put(`${baseURL}/api/admin/events`, {
        data: { id, title: `${title} (edited)`, location: "Kilakarai" },
      });
      expect(updated.ok()).toBe(true);
      expect((await updated.json()).data.title).toBe(`${title} (edited)`);

      const del = await context.request.delete(`${baseURL}/api/admin/events`, {
        data: { id },
      });
      expect(del.ok()).toBe(true);
      id = undefined;
    } finally {
      if (id) await serviceClient().from("events").delete().eq("id", id);
    }
  });

  test("news round trip: create, update, delete", async ({ context, baseURL }) => {
    const title = `E2E News ${Date.now()}`;
    let id: string | undefined;

    try {
      const created = await context.request.post(`${baseURL}/api/admin/news`, {
        data: {
          title,
          summary: "Created by the e2e suite.",
          content: "Body.",
          institution_id: null,
          published_at: "2027-03-01",
        },
      });
      expect(created.status()).toBe(201);
      id = (await created.json()).data.id;

      const updated = await context.request.put(`${baseURL}/api/admin/news`, {
        data: { id, summary: "Edited." },
      });
      expect(updated.ok()).toBe(true);
      expect((await updated.json()).data.summary).toBe("Edited.");

      expect(
        (await context.request.delete(`${baseURL}/api/admin/news`, { data: { id } })).ok()
      ).toBe(true);
      id = undefined;
    } finally {
      if (id) await serviceClient().from("news").delete().eq("id", id);
    }
  });

  test("institution_name is never written to events (schema regression)", async ({
    context,
    baseURL,
  }) => {
    // The column does not exist — the public layer resolves names via FK join.
    // Sending it used to fail the whole save with a schema-cache error, which
    // is why admin routes build from an explicit allowlist (DECISIONS #14).
    let id: string | undefined;
    try {
      const res = await context.request.post(`${baseURL}/api/admin/events`, {
        data: {
          title: `E2E Allowlist ${Date.now()}`,
          date_start: "2027-04-01",
          category: "Community",
          institution_name: "Should Be Ignored",
          created_at: "1999-01-01",
        },
      });
      expect(res.status(), "extra fields must be dropped, not rejected").toBe(201);
      id = (await res.json()).data.id;
    } finally {
      if (id) await serviceClient().from("events").delete().eq("id", id);
    }
  });
});

test.describe("member status transitions", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  let admin: TestAdmin;
  let member: TestMember;

  test.beforeEach(async ({ context, baseURL }) => {
    admin = await createAdmin();
    member = await createMember({ status: "pending", emailPrefix: "transition" });
    await signInAdmin(context, baseURL!, admin);
  });

  test.afterEach(async () => {
    await deleteMember(member).catch(() => {});
    await deleteAdmin(admin).catch(() => {});
  });

  test("approve, suspend and reject all persist", async ({ context, baseURL }) => {
    const patch = (status: string, reason?: string) =>
      context.request.patch(`${baseURL}/api/admin/members/${member.id}/status`, {
        data: { status, reason },
      });

    expect((await patch("approved")).ok()).toBe(true);
    expect((await readStatus(member.id)).status).toBe("approved");

    expect((await patch("suspended")).ok()).toBe(true);
    expect((await readStatus(member.id)).status).toBe("suspended");

    expect((await patch("rejected", "Not a Crescent alumnus.")).ok()).toBe(true);
    const after = await readStatus(member.id);
    expect(after.status).toBe("rejected");
    expect(after.rejection_reason).toBe("Not a Crescent alumnus.");
  });

  test("an invalid status is rejected", async ({ context, baseURL }) => {
    const res = await context.request.patch(
      `${baseURL}/api/admin/members/${member.id}/status`,
      { data: { status: "superuser" } }
    );
    expect(res.status()).toBe(422);
    expect((await readStatus(member.id)).status).toBe("pending");
  });

  test("approving lets the member into the directory", async ({
    browser,
    context,
    baseURL,
  }) => {
    await context.request.patch(`${baseURL}/api/admin/members/${member.id}/status`, {
      data: { status: "approved" },
    });

    // Fresh context: no admin cookie, member signs in from scratch.
    const memberContext = await browser.newContext();
    try {
      await signInMember(memberContext, baseURL!, member);
      const page = await memberContext.newPage();
      await page.goto("/connect/directory");
      await expect(page).toHaveURL(/\/connect\/directory/);
    } finally {
      await memberContext.close();
    }
  });
});

async function readStatus(id: string) {
  const { data } = await serviceClient()
    .from("profiles")
    .select("status, rejection_reason")
    .eq("id", id)
    .single();
  return data as { status: string; rejection_reason: string | null };
}
