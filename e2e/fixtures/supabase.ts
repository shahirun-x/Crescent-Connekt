import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Test-only Supabase access.
 *
 * SAFETY: this reads TEST_* variables exclusively. It will never fall back to
 * NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY, because a fallback is
 * exactly how a suite that creates and deletes users ends up pointed at the
 * production project. If the TEST_* vars are absent, the DB-dependent tests
 * skip with a message rather than running against whatever happens to be set.
 */

export const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL ?? "";
export const TEST_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY ?? "";
export const TEST_SUPABASE_SERVICE_ROLE_KEY =
  process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hasTestDb = Boolean(
  TEST_SUPABASE_URL && TEST_SUPABASE_ANON_KEY && TEST_SUPABASE_SERVICE_ROLE_KEY
);

/** Reason string for test.skip(), so a skipped run explains itself. */
export const NO_DB_REASON =
  "Needs a test Supabase project. Set TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY " +
  "and TEST_SUPABASE_SERVICE_ROLE_KEY. See docs/RUNBOOK.md → Running the E2E suite.";

let service: SupabaseClient | null = null;
let anon: SupabaseClient | null = null;

/** Service-role client. Bypasses RLS — test setup and teardown only. */
export function serviceClient(): SupabaseClient {
  if (!hasTestDb) throw new Error(NO_DB_REASON);
  service ??= createClient(TEST_SUPABASE_URL, TEST_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return service;
}

/**
 * Anon client, for asserting what an unprivileged caller can actually read.
 * Some of the privacy tests are only meaningful through this client, since the
 * service role bypasses the RLS being tested.
 */
export function anonClient(): SupabaseClient {
  if (!hasTestDb) throw new Error(NO_DB_REASON);
  anon ??= createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return anon;
}

/**
 * Guard against pointing the suite at production.
 *
 * The production ref is hardcoded because it is public (it is in CLAUDE.md and
 * every asset URL) and because the cost of a wrong match here is deleting real
 * members. Refuse to run rather than trust the operator's shell.
 */
const PRODUCTION_REF = "zxffaohxxzbthspeelpj";

export function assertNotProduction() {
  if (!hasTestDb) return;
  if (TEST_SUPABASE_URL.includes(PRODUCTION_REF)) {
    throw new Error(
      `TEST_SUPABASE_URL points at the PRODUCTION project (${PRODUCTION_REF}). ` +
        "This suite creates and deletes users. Point it at a separate test project."
    );
  }
}
