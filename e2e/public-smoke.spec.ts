import { test, expect } from "@playwright/test";

/**
 * Public surface smoke tests. No database required — these run everywhere.
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
 * Routes that must NEVER be indexed, and the exact content expected.
 *
 * This is the permanent guard for DECISIONS #26: a "use client" page cannot
 * export `metadata` and silently inherits the root layout's index:true, with
 * no warning from Next. Three routes shipped crawlable because of it. The trap
 * is invisible in source — it only shows in built output — so it needs a test
 * that reads the rendered tag.
 */
const NOINDEX_ROUTES: { path: string; expected: string }[] = [
  { path: "/connect/login", expected: "noindex, nofollow" },
  { path: "/connect/signup", expected: "noindex, nofollow" },
  { path: "/connect/callback", expected: "noindex, nofollow, nocache" },
  { path: "/connect/forgot-password", expected: "noindex, nofollow" },
  { path: "/connect/reset-password", expected: "noindex, nofollow, nocache" },
  { path: "/admin/login", expected: "noindex, nofollow" },
];

test.describe("public routes", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`${path} returns 200 and renders an h1`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} status`).toBe(200);

      // A 200 that renders an error boundary is not a passing page.
      await expect(page.locator("h1").first()).toBeVisible();
    });
  }

  test("public routes are indexable", async ({ page }) => {
    for (const path of PUBLIC_ROUTES) {
      await page.goto(path);
      const robots = await page
        .locator('meta[name="robots"]')
        .first()
        .getAttribute("content")
        .catch(() => null);
      // Either absent (default indexable) or explicitly index.
      if (robots) {
        expect(robots, `${path} robots meta`).toContain("index");
        expect(robots, `${path} robots meta`).not.toContain("noindex");
      }
    }
  });
});

test.describe("indexing guard (DECISIONS #26)", () => {
  for (const { path, expected } of NOINDEX_ROUTES) {
    test(`${path} emits "${expected}"`, async ({ page }) => {
      await page.goto(path);
      const robots = await page
        .locator('meta[name="robots"]')
        .first()
        .getAttribute("content");
      expect(robots, `${path} must not be indexable`).toBe(expected);
    });
  }

  test("X-Robots-Tag header covers private surfaces", async ({ request }) => {
    for (const path of ["/admin", "/connect/directory", "/api/connect/directory"]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(
        res.headers()["x-robots-tag"],
        `${path} X-Robots-Tag`
      ).toContain("noindex");
    }
  });

  test("X-Robots-Tag does NOT cover /connect or public pages", async ({ request }) => {
    for (const path of ["/connect", "/calendar"]) {
      const res = await request.get(path);
      expect(res.headers()["x-robots-tag"], `${path} must stay indexable`).toBeUndefined();
    }
  });

  test("robots.txt disallows every private route", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    for (const p of [
      "/admin",
      "/api/",
      "/connect/directory",
      "/connect/profile",
      "/connect/setup",
      "/connect/pending",
      "/connect/status",
      "/connect/login",
      "/connect/signup",
      "/connect/callback",
      "/connect/forgot-password",
      "/connect/reset-password",
    ]) {
      expect(body, `robots.txt should disallow ${p}`).toContain(`Disallow: ${p}`);
    }
  });

  test("sitemap lists only public routes", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const forbidden of ["/admin", "/connect/directory", "/connect/login"]) {
      expect(xml, `sitemap must not list ${forbidden}`).not.toContain(
        `${forbidden}<`
      );
    }
    expect(xml).toContain("/institutions");
  });
});

/**
 * Requests that fail off-Vercel and are not defects.
 *
 * `/_vercel/insights/script.js` is injected by @vercel/analytics and is only
 * served by Vercel's edge. Every page 404s it locally and in CI, which is
 * expected — but the browser reports it as a bare "Failed to load resource"
 * console error with no URL attached, so filtering console TEXT cannot
 * distinguish it from a real failure. That is why this test asserts on
 * response URLs instead: the URL is the only part that identifies the cause.
 */
const EXPECTED_OFF_PLATFORM = [/\/_vercel\//];

/** Third-party hosts we do not control and will not fail the build over. */
const EXTERNAL = [/tile\.openstreetmap\.org/, /images\.unsplash\.com/];

test.describe("console health", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`${path} has no page errors or broken requests`, async ({ page }) => {
      const pageErrors: string[] = [];
      const failedResponses: string[] = [];

      // A thrown exception is unambiguous — always a defect.
      page.on("pageerror", (err) => pageErrors.push(String(err)));

      page.on("response", (res) => {
        if (res.status() < 400) return;
        const url = res.url();
        if (EXPECTED_OFF_PLATFORM.some((re) => re.test(url))) return;
        if (EXTERNAL.some((re) => re.test(url))) return;
        failedResponses.push(`${res.status()} ${url}`);
      });

      await page.goto(path, { waitUntil: "networkidle" });

      expect(pageErrors, `uncaught JS errors on ${path}`).toEqual([]);
      expect(failedResponses, `failed requests on ${path}`).toEqual([]);
    });
  }
});

test.describe("map", () => {
  test("tiles load from OpenStreetMap without a watermark", async ({ page }) => {
    // Regression guard for the CARTO watermark incident: CARTO kept returning
    // HTTP 200 with a valid PNG that had "API KEY REQUIRED" burned into it, so
    // status alone proves nothing. Assert the HOST, which is what actually
    // changed, plus that tiles decoded to real images.
    await page.goto("/institutions", { waitUntil: "networkidle" });
    await page.locator(".leaflet-container").first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);

    const tiles = await page.locator("img.leaflet-tile").evaluateAll((imgs) =>
      imgs.map((i) => {
        const img = i as HTMLImageElement;
        return {
          host: (() => {
            try {
              return new URL(img.src).host;
            } catch {
              return "";
            }
          })(),
          loaded: img.complete && img.naturalWidth > 0,
        };
      })
    );

    test.skip(tiles.length === 0, "No tiles rendered — map may be offline in CI");

    expect(tiles.every((t) => t.loaded), "every tile decoded").toBe(true);
    expect(
      tiles.every((t) => t.host.endsWith("tile.openstreetmap.org")),
      "tiles must come from OSM, not a watermarking provider"
    ).toBe(true);
  });
});
