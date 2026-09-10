import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config.
 *
 * Runs against a PRODUCTION build, not `next dev`. Several behaviours this
 * suite exists to guard only exist in a production build — route-level
 * `robots` metadata, ISR, middleware redirects and the real bundle — so
 * testing the dev server would prove nothing about what ships.
 *
 * `npm run build` also runs the contrast gate via its prebuild hook, so a
 * failing colour pair stops the suite before a single test runs.
 */

const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Serial by default: the suite creates and deletes real rows in a shared
  // Supabase project, and the rate-limit tests are order-sensitive because the
  // limiter is per-process in-memory. Parallelism here buys seconds and costs
  // flakes.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"], ["list"]]
    : [["html", { open: "never" }], ["list"]],

  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile-chromium",
      // iPhone 13 is 390x844. Using Playwright's descriptor keeps the UA and
      // touch flags consistent with a real device, which matters for the
      // pointer:coarse rules and the calendar's touch paths.
      use: { ...devices["iPhone 13"] },
    },
  ],

  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      // The app reads NEXT_PUBLIC_* at build time. Point the build at the TEST
      // project so a run can never touch production data, and fail loudly
      // rather than silently building against nothing.
      NEXT_PUBLIC_SUPABASE_URL: process.env.TEST_SUPABASE_URL ?? "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY ?? "",
      SUPABASE_SERVICE_ROLE_KEY: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ?? "",
      NEXT_PUBLIC_SITE_URL: BASE_URL,
      // Keep the Google button hidden unless a test opts in.
      NEXT_PUBLIC_GOOGLE_AUTH_ENABLED: "false",
    },
  },
});
