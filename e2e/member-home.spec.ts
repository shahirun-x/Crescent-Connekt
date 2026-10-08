import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { hasTestDb, NO_DB_REASON, assertNotProduction } from "./fixtures/supabase";
import {
  anyInstitutionId,
  createMember,
  deleteMember,
  signInMember,
  type TestMember,
} from "./fixtures/members";

/**
 * /connect/home — the member home.
 *
 * Privacy assertions follow e2e/privacy.spec.ts: check the rendered page AND
 * everything sent to the browser. A server component can still leak through
 * its RSC payload, so the raw HTML response (which carries that payload
 * inline) is checked, not just the visible text.
 */

test.describe("member home", () => {
  test.skip(!hasTestDb, NO_DB_REASON);
  test.beforeAll(() => assertNotProduction());

  const created: TestMember[] = [];
  const make = async (opts: Parameters<typeof createMember>[0]) => {
    const m = await createMember(opts);
    created.push(m);
    return m;
  };

  test.afterEach(async () => {
    for (const m of created.splice(0)) await deleteMember(m).catch(() => {});
  });

  test("an approved member lands on /connect/home after login", async ({ page }) => {
    const member = await make({ status: "approved", emailPrefix: "home-login" });

    // Through the real login form: the redirect under test lives in the
    // login page, not in the session endpoint.
    await page.goto("/connect/login");
    await page.getByLabel(/email/i).fill(member.email);
    await page.getByLabel(/password/i).first().fill(member.password);
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    await expect(page).toHaveURL(/\/connect\/home$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /welcome back/i })
    ).toBeVisible();
  });

  test("a pending member is redirected away from /connect/home", async ({
    page,
    context,
    baseURL,
  }) => {
    const member = await make({ status: "pending", emailPrefix: "home-pending" });
    await signInMember(context, baseURL!, member);

    await page.goto("/connect/home");
    await expect(page).toHaveURL(/\/connect\/pending/);
  });

  test("another member's email and phone never reach the page when consent is off", async ({
    page,
    context,
    baseURL,
  }) => {
    const institutionId = await anyInstitutionId();
    const viewer = await make({ status: "approved", institutionId, emailPrefix: "home-viewer" });
    const subject = await make({
      status: "approved",
      institutionId,
      fullName: "Home Privacy Subject",
      phone: "+91 98888 77777",
      showEmail: false,
      showPhone: false,
      emailPrefix: "home-subject",
    });
    await signInMember(context, baseURL!, viewer);

    // The raw HTML — server-rendered markup plus the inline RSC payload that
    // hydrates it. If a field reached the client in any form, it is in here.
    const res = await context.request.get(`${baseURL}/connect/home`);
    expect(res.ok()).toBeTruthy();
    const html = await res.text();

    // Guard against a vacuous pass: the subject must actually be on the page,
    // or "email not present" proves nothing.
    expect(html, "subject should appear under People").toContain(subject.fullName);
    expect(html, "email must not be sent").not.toContain(subject.email);
    expect(html, "phone must not be sent").not.toContain("98888");

    // And the rendered page, after hydration and any client-side fetches.
    await page.goto("/connect/home");
    const text = await page.locator("body").innerText();
    expect(text).toContain(subject.fullName);
    expect(text).not.toContain(subject.email);
    expect(text).not.toContain("98888");
  });

  test("a pending member from the same institution never appears under People", async ({
    page,
    context,
    baseURL,
  }) => {
    const institutionId = await anyInstitutionId();
    const viewer = await make({ status: "approved", institutionId, emailPrefix: "home-v2" });
    const pending = await make({
      status: "pending",
      institutionId,
      fullName: "Home Pending Classmate",
      emailPrefix: "home-pend",
    });
    // Also rejected and suspended — the rule is "approved only", not "not pending".
    const rejected = await make({
      status: "rejected",
      institutionId,
      fullName: "Home Rejected Classmate",
      emailPrefix: "home-rej",
    });
    const suspended = await make({
      status: "suspended",
      institutionId,
      fullName: "Home Suspended Classmate",
      emailPrefix: "home-susp",
    });
    await signInMember(context, baseURL!, viewer);

    const html = await (await context.request.get(`${baseURL}/connect/home`)).text();
    for (const m of [pending, rejected, suspended]) {
      expect(html, `${m.fullName} must not be sent`).not.toContain(m.fullName);
      expect(html, `${m.fullName}'s id must not be sent`).not.toContain(m.id);
    }

    await page.goto("/connect/home");
    const people = page.getByRole("region", { name: /people from/i });
    for (const m of [pending, rejected, suspended]) {
      await expect(people.getByText(m.fullName)).toHaveCount(0);
    }
  });

  test("a member with no institution gets the network-wide fallbacks", async ({
    page,
    context,
    baseURL,
  }) => {
    const member = await make({
      status: "approved",
      institutionId: null,
      emailPrefix: "home-noinst",
    });
    // Someone else approved, so "newest across the network" has a row to show.
    const other = await make({
      status: "approved",
      institutionId: null,
      fullName: "Home Network Newcomer",
      emailPrefix: "home-other",
    });
    await signInMember(context, baseURL!, member);

    await page.goto("/connect/home");
    await expect(page.getByRole("heading", { name: "New to the network" })).toBeVisible();
    await expect(page.getByText(other.fullName)).toBeVisible();
    await expect(page.getByText("Across the network").first()).toBeVisible();
    // No institution-scoped headings, and no invite to "the first from X".
    await expect(page.getByRole("heading", { name: /people from/i })).toHaveCount(0);
    await expect(page.getByText(/one of the first from/i)).toHaveCount(0);
  });

  test("the page is noindex by meta tag and by header", async ({ context, baseURL }) => {
    const member = await make({ status: "approved", emailPrefix: "home-robots" });
    await signInMember(context, baseURL!, member);

    const res = await context.request.get(`${baseURL}/connect/home`);
    expect(res.headers()["x-robots-tag"] ?? "").toMatch(/noindex/);
    expect(await res.text()).toMatch(/<meta name="robots" content="noindex, nofollow"/);
  });

  test("has no axe violations, with every section populated", async ({
    page,
    context,
    baseURL,
  }) => {
    // Incomplete profile (no avatar, bio or LinkedIn) so the completeness
    // section renders too — an axe run on a page missing sections tests less.
    const institutionId = await anyInstitutionId();
    const viewer = await make({ status: "approved", institutionId, emailPrefix: "home-axe" });
    await make({ status: "approved", institutionId, fullName: "Home Axe Classmate", emailPrefix: "home-axe2" });
    await signInMember(context, baseURL!, viewer);

    await page.goto("/connect/home", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const detail = results.violations
      .map((v) => `${v.id} (${v.impact}) — ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)
      .join("\n");
    expect(results.violations.map((v) => v.id), detail).toEqual([]);
  });
});
