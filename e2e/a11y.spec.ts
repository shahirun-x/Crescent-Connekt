import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility regression suite.
 *
 * The keyboard work from the a11y pass — the roving-tabindex calendar grid
 * especially — was verified once by hand and has had no guard since. These
 * tests are that guard.
 */

const PUBLIC_ROUTES = [
  "/",
  "/institutions",
  "/calendar",
  "/news",
  "/about",
  "/connect",
  "/contact",
];

/**
 * Known, accepted axe findings.
 *
 * EMPTY on purpose. If a route develops a violation, the fix is to fix it or to
 * add it here WITH a reason and a ticket — never to lower the threshold or drop
 * a rule globally, which would silently stop testing everything else it covers.
 */
const KNOWN_VIOLATIONS: Record<string, string[]> = {};

test.describe("axe — WCAG 2 A/AA", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`${path} has no violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });

      // Reveal animations start at opacity 0; axe flags low contrast on text
      // mid-fade. Settle first so we test the resting state.
      await page.waitForTimeout(1200);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const allowed = KNOWN_VIOLATIONS[path] ?? [];
      const unexpected = results.violations.filter(
        (v) => !allowed.includes(v.id)
      );

      // Name the rule and the offending node, so a failure is actionable
      // without opening the HTML report.
      const detail = unexpected
        .map(
          (v) =>
            `${v.id} (${v.impact}) — ${v.help}\n    ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(" "))
              .join("\n    ")}`
        )
        .join("\n");

      expect(unexpected.map((v) => v.id), `axe violations on ${path}:\n${detail}`).toEqual([]);
    });
  }
});

test.describe("calendar keyboard grid", () => {
  /** Focus the grid's single tab stop and return its accessible name. */
  async function focusGrid(page: Page) {
    const stop = page.locator('[role="grid"] button[tabindex="0"]').first();
    await expect(stop).toHaveCount(1);
    await stop.focus();
    return stop;
  }

  const focusedLabel = (page: Page) =>
    page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");

  test("the month grid is exactly one tab stop", async ({ page }) => {
    await page.goto("/calendar");
    await page.locator('[role="grid"]').first().waitFor();

    // The APG grid pattern: 42 cells, one tab stop. If this becomes 42 the
    // roving tabindex has regressed and keyboard users must tab through a
    // month to get past the calendar.
    const tabbable = page.locator('[role="grid"] button[tabindex="0"]');
    await expect(tabbable).toHaveCount(1);

    const cells = page.locator('[role="grid"] [role="gridcell"]');
    expect(await cells.count()).toBeGreaterThanOrEqual(28);
  });

  test("empty days stay reachable (aria-disabled, not disabled)", async ({ page }) => {
    await page.goto("/calendar");
    await page.locator('[role="grid"]').first().waitFor();

    // Days with no events were `disabled`, which removed them from the tab
    // order entirely and made most of the month unreachable. They must be
    // aria-disabled instead.
    const hardDisabled = page.locator('[role="grid"] button[disabled]');
    await expect(hardDisabled).toHaveCount(0);

    const ariaDisabled = page.locator('[role="grid"] button[aria-disabled="true"]');
    expect(await ariaDisabled.count()).toBeGreaterThan(0);
  });

  test("arrow keys move focus by day and week", async ({ page }) => {
    await page.goto("/calendar");
    await page.locator('[role="grid"]').first().waitFor();
    await focusGrid(page);

    const start = await focusedLabel(page);
    expect(start).not.toBe("");

    await page.keyboard.press("ArrowRight");
    const right = await focusedLabel(page);
    expect(right, "ArrowRight should move focus").not.toBe(start);

    await page.keyboard.press("ArrowLeft");
    expect(await focusedLabel(page), "ArrowLeft should return").toBe(start);

    await page.keyboard.press("ArrowDown");
    const down = await focusedLabel(page);
    expect(down, "ArrowDown should move a week").not.toBe(start);

    await page.keyboard.press("ArrowUp");
    expect(await focusedLabel(page), "ArrowUp should return").toBe(start);
  });

  test("Home and End jump to the ends of the week", async ({ page }) => {
    await page.goto("/calendar");
    await page.locator('[role="grid"]').first().waitFor();
    await focusGrid(page);

    await page.keyboard.press("Home");
    const home = await focusedLabel(page);
    await page.keyboard.press("End");
    const end = await focusedLabel(page);

    expect(home, "Home and End must land on different days").not.toBe(end);
    // Monday-first week: Home is Monday, End is Sunday.
    expect(home.toLowerCase()).toContain("monday");
    expect(end.toLowerCase()).toContain("sunday");
  });

  test("PageUp and PageDown change month", async ({ page }) => {
    await page.goto("/calendar");
    await page.locator('[role="grid"]').first().waitFor();
    await focusGrid(page);

    const before = await focusedLabel(page);
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(400); // month re-renders, then focus is restored
    const after = await focusedLabel(page);

    expect(after, "PageDown should move to the next month").not.toBe(before);
    expect(after, "focus must survive the month change").not.toBe("");
  });

  test("focus ring is visible on a focused day", async ({ page }) => {
    await page.goto("/calendar");
    await page.locator('[role="grid"]').first().waitFor();
    await focusGrid(page);
    await page.keyboard.press("ArrowRight");

    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const s = getComputedStyle(el);
      return { width: s.outlineWidth, style: s.outlineStyle };
    });

    expect(outline, "a focused day must have a visible outline").not.toBeNull();
    expect(outline!.style).not.toBe("none");
    expect(parseFloat(outline!.width)).toBeGreaterThan(0);
  });
});

test.describe("skip link", () => {
  test("first Tab reveals a working skip link", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const focused = await page.evaluate(() => ({
      text: document.activeElement?.textContent?.trim() ?? "",
      href: (document.activeElement as HTMLAnchorElement | null)?.getAttribute("href") ?? "",
    }));

    expect(focused.text.toLowerCase()).toContain("skip");
    expect(focused.href).toBe("#main");
    await expect(page.locator("#main")).toHaveCount(1);
  });
});
