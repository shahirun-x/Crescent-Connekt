import { test, expect } from "@playwright/test";
import { hasTestDb, NO_DB_REASON, assertNotProduction, serviceClient } from "./fixtures/supabase";
import {
  createMember,
  deleteMember,
  signInMember,
  setStatus,
  uniqueEmail,
  TEST_PASSWORD,
  type TestMember,
} from "./fixtures/members";

/**
 * Member journey: signup → setup wizard → pending → approved → directory.
 *
 * These paths have never been exercised end to end. The approval question in
 * particular ("does an approved member need to sign in again?") was unknown;
 * the test below establishes the answer and pins it.
 */

test.describe("signup and profile setup", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  const created: string[] = [];

  test.afterEach(async () => {
    const sb = serviceClient();
    for (const id of created.splice(0)) {
      await sb.from("profiles").delete().eq("id", id);
      await sb.auth.admin.deleteUser(id).catch(() => {});
    }
  });

  test("a new member completes the three-step wizard and lands on pending", async ({
    page,
    context,
    baseURL,
  }) => {
    // Create the auth user out of band — Supabase's own signup rate limit makes
    // repeated UI signups flaky, and this test is about the WIZARD, not about
    // whether Supabase can create a user.
    const email = uniqueEmail("wizard");
    const { data, error } = await serviceClient().auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    expect(error).toBeNull();
    const id = data.user!.id;
    created.push(id);

    await signInMember(context, baseURL!, {
      id,
      email,
      password: TEST_PASSWORD,
      fullName: "Wizard Walker",
      avatarPaths: [],
    });

    // With a session but no profile, every gated route funnels to setup.
    await page.goto("/connect/directory");
    await expect(page).toHaveURL(/\/connect\/setup/);

    // Step 1 — name and role.
    await page.getByLabel("Full name").fill("Wizard Walker");
    await page.getByRole("button", { name: /^Alumni/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2 — institution, city.
    await expect(page.getByText(/Step 2 of 3/)).toBeVisible();
    await page.getByLabel("Current city").fill("Chennai");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3 — headline and privacy toggles.
    await expect(page.getByText(/Step 3 of 3/)).toBeVisible();
    await page.getByLabel("Headline").fill("Built by the e2e suite");
    await page.getByRole("button", { name: /Submit for review/ }).click();

    // The session must survive the setup → pending redirect. If the cookie were
    // dropped the pending page would bounce back to login.
    await expect(page).toHaveURL(/\/connect\/pending/, { timeout: 15000 });
    await expect(page.getByText(/under review/i)).toBeVisible();
    await expect(page.getByText("Wizard Walker")).toBeVisible();

    const { data: profile } = await serviceClient()
      .from("profiles")
      .select("status, full_name, role")
      .eq("id", id)
      .single();
    expect(profile?.status, "a new profile must land as pending").toBe("pending");
    expect(profile?.full_name).toBe("Wizard Walker");
  });

  test("the wizard blocks step 1 without a role", async ({ page, context, baseURL }) => {
    const email = uniqueEmail("wizard-validate");
    const { data } = await serviceClient().auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    created.push(data.user!.id);

    await signInMember(context, baseURL!, {
      id: data.user!.id,
      email,
      password: TEST_PASSWORD,
      fullName: "x",
      avatarPaths: [],
    });

    await page.goto("/connect/setup");
    await page.getByLabel("Full name").fill("No Role Chosen");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("alert")).toContainText(/role/i);
    await expect(page.getByText(/Step 1 of 3/)).toBeVisible();
  });
});

test.describe("approval transition", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  let member: TestMember;

  test.beforeEach(async () => {
    member = await createMember({ status: "pending", emailPrefix: "approval" });
  });
  test.afterEach(async () => {
    await deleteMember(member).catch(() => {});
  });

  /**
   * Documents the answer to an open question: after an admin approves, does the
   * member have to sign in again?
   *
   * They do NOT. The member cookie holds a Supabase access token, and status is
   * read from the database on every request rather than baked into the session.
   * So approval takes effect on the next navigation. This test pins that
   * behaviour — if a future change starts caching status in the cookie or the
   * token, this fails and the regression is caught.
   */
  test("approval takes effect without re-login", async ({ page, context, baseURL }) => {
    await signInMember(context, baseURL!, member);

    await page.goto("/connect/directory");
    await expect(page, "pending members go to the holding page").toHaveURL(
      /\/connect\/pending/
    );

    await setStatus(member.id, "approved");

    // Same cookie, no new sign-in.
    await page.goto("/connect/directory");
    await expect(
      page,
      "approval must apply on the next request, with the same session"
    ).toHaveURL(/\/connect\/directory/);
  });

  test("suspension revokes access with the same session", async ({
    page,
    context,
    baseURL,
  }) => {
    await setStatus(member.id, "approved");
    await signInMember(context, baseURL!, member);

    await page.goto("/connect/directory");
    await expect(page).toHaveURL(/\/connect\/directory/);

    await setStatus(member.id, "suspended");

    await page.goto("/connect/directory");
    await expect(page, "suspension must apply immediately").toHaveURL(
      /\/connect\/status/
    );
  });
});

test.describe("profile edit", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  test("edits persist and do not reset approval", async ({ page, context, baseURL }) => {
    const member = await createMember({ status: "approved", emailPrefix: "edit" });
    try {
      await signInMember(context, baseURL!, member);

      await page.goto("/connect/profile/edit");
      const headline = `Edited ${Date.now()}`;
      await page.getByLabel("Headline").fill(headline);
      await page.getByRole("button", { name: /Save changes/ }).click();

      await expect(page).toHaveURL(/\/connect\/profile\//, { timeout: 15000 });
      await expect(page.getByText(headline)).toBeVisible();

      const { data } = await serviceClient()
        .from("profiles")
        .select("headline, status")
        .eq("id", member.id)
        .single();
      expect(data?.headline).toBe(headline);
      expect(
        data?.status,
        "editing must not send an approved member back to pending"
      ).toBe("approved");
    } finally {
      await deleteMember(member);
    }
  });
});
