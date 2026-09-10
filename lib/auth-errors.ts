/**
 * Supabase auth errors → messages a person can act on.
 *
 * Supabase surfaces raw API errors, and some of them are shaped for a
 * developer rather than a visitor. The one that prompted this file was:
 *
 *   {"code":400,"error_code":"validation_failed",
 *    "msg":"Unsupported provider: provider is not enabled"}
 *
 * ...rendered verbatim in the sign-in form. Nothing here should ever reach a
 * user as JSON, a status code, or a bare provider string.
 *
 * The full error is still logged to the console via `logAuthError`, so the
 * detail is available in the browser console and in Vercel logs — the user
 * simply is not the audience for it.
 */

/**
 * Shape we can rely on across supabase-js versions, plus fetch failures.
 *
 * `code` is typed loosely on purpose. The GoTrue REST body that prompted this
 * file sends `"code": 400` as a NUMBER while supabase-js sends a string slug
 * like "invalid_credentials". Assuming string here made the mapper itself
 * throw on the exact payload it was written to handle.
 */
interface LooseAuthError {
  message?: unknown;
  code?: unknown;
  status?: unknown;
  error_code?: unknown;
  msg?: unknown;
  name?: unknown;
}

/** Coerce any of the above to a lowercase string without throwing. */
const str = (v: unknown): string =>
  typeof v === "string" ? v.toLowerCase() : v == null ? "" : String(v).toLowerCase();

export const AUTH_FALLBACK =
  "Something went wrong on our side. Please try again in a moment.";

/**
 * Ordered because the first match wins. Specific codes are checked before
 * message substrings, since codes are stable and copy is not.
 */
function classify(err: LooseAuthError): string | null {
  // Both fields are consulted: GoTrue puts the slug in error_code when code
  // holds the numeric HTTP status.
  const code = str(err.code) || str(err.error_code);
  const codeAlt = str(err.error_code);
  const msg = str(err.message) || str(err.msg);
  const name = str(err.name);
  const status =
    typeof err.status === "number"
      ? err.status
      : Number.isFinite(Number(err.status))
        ? Number(err.status)
        : typeof err.code === "number"
          ? err.code
          : undefined;

  const isCode = (c: string) => code === c || codeAlt === c;

  // --- Provider not configured -------------------------------------------
  // Should be unreachable now that the button is behind a flag, but a stale
  // tab or a direct call can still hit it.
  if (
    isCode("validation_failed") &&
    (msg.includes("provider is not enabled") || msg.includes("unsupported provider"))
  ) {
    return "Google sign-in isn't available yet. Please use your email and password.";
  }
  if (msg.includes("provider is not enabled") || msg.includes("unsupported provider")) {
    return "That sign-in method isn't available yet. Please use your email and password.";
  }

  // --- Credentials --------------------------------------------------------
  if (isCode("invalid_credentials") || msg.includes("invalid login credentials")) {
    return "That email and password don't match. Please check both and try again.";
  }
  if (isCode("user_not_found") || msg.includes("user not found")) {
    return "We couldn't find an account with that email address.";
  }
  if (msg.includes("invalid email") || msg.includes("unable to validate email")) {
    return "Please enter a valid email address.";
  }

  // --- Email verification -------------------------------------------------
  if (
    isCode("email_not_confirmed") ||
    msg.includes("email not confirmed") ||
    msg.includes("not confirmed")
  ) {
    return "Please confirm your email address first — check your inbox for the link we sent, including the spam folder.";
  }

  // --- Registration -------------------------------------------------------
  if (
    isCode("user_already_exists") ||
    msg.includes("already registered") ||
    msg.includes("user already registered")
  ) {
    return "An account with that email already exists. Try signing in instead.";
  }
  if (isCode("weak_password") || msg.includes("password should be at least")) {
    return "Please choose a longer password — at least 8 characters.";
  }
  if (msg.includes("signups not allowed") || isCode("signup_disabled")) {
    return "New sign-ups are closed at the moment. Please contact us if you need access.";
  }

  // --- Rate limiting ------------------------------------------------------
  if (
    status === 429 ||
    isCode("over_request_rate_limit") ||
    isCode("over_email_send_rate_limit") ||
    msg.includes("rate limit") ||
    msg.includes("too many requests")
  ) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  // --- Expired / used links ----------------------------------------------
  if (
    isCode("otp_expired") ||
    msg.includes("token has expired") ||
    msg.includes("expired or is invalid")
  ) {
    return "That link has expired or has already been used. Please request a new one.";
  }

  // --- Network ------------------------------------------------------------
  if (
    name === "typeerror" ||
    name === "aborterror" ||
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("load failed")
  ) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  // --- Server -------------------------------------------------------------
  if (typeof status === "number" && status >= 500) {
    return "Our sign-in service is having trouble right now. Please try again shortly.";
  }

  return null;
}

/**
 * Log the full error for debugging. Always call this alongside the friendly
 * message — the detail must not be lost just because the user does not see it.
 */
export function logAuthError(context: string, err: unknown) {
  console.error(`[auth:${context}]`, err);
}

/**
 * Friendly message for any auth failure. Never returns raw JSON, a status
 * code, or an untranslated Supabase string.
 *
 * @param context short label for the console log, e.g. "member-login"
 */
export function authErrorMessage(err: unknown, context: string): string {
  logAuthError(context, err);

  if (!err) return AUTH_FALLBACK;

  // A string that is actually a JSON body must never be shown as-is.
  if (typeof err === "string") {
    const trimmed = err.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return classify(JSON.parse(trimmed)) ?? AUTH_FALLBACK;
      } catch {
        return AUTH_FALLBACK;
      }
    }
    return classify({ message: trimmed }) ?? AUTH_FALLBACK;
  }

  if (typeof err === "object") {
    return classify(err as LooseAuthError) ?? AUTH_FALLBACK;
  }

  return AUTH_FALLBACK;
}

/**
 * Same, for an error our own API routes returned as JSON.
 *
 * Our routes already write human copy, so that is preferred — but only when it
 * looks like a sentence. A route that leaked a Supabase string (or anything
 * JSON-shaped) falls through to the mapper rather than being passed on.
 */
export function apiErrorMessage(
  payload: unknown,
  context: string,
  fallback = AUTH_FALLBACK
): string {
  const raw =
    typeof payload === "object" && payload !== null
      ? (payload as { error?: unknown }).error
      : payload;

  if (typeof raw === "string" && raw.trim() && !raw.trim().startsWith("{")) {
    // Looks like prose we wrote; a Supabase artefact still gets mapped.
    const mapped = classify({ message: raw });
    if (mapped) {
      logAuthError(context, raw);
      return mapped;
    }
    return raw;
  }

  logAuthError(context, payload);
  return typeof raw === "object" && raw !== null
    ? (classify(raw as LooseAuthError) ?? fallback)
    : fallback;
}

/**
 * Whether to offer Google sign-in.
 *
 * Defaults to FALSE. The button was rendering while the provider was disabled
 * in Supabase, so every click returned "Unsupported provider: provider is not
 * enabled". Flip NEXT_PUBLIC_GOOGLE_AUTH_ENABLED to "true" only after the
 * provider is actually configured — see docs/RUNBOOK.md.
 *
 * Read at module scope: NEXT_PUBLIC_* vars are inlined at build time, so a
 * change requires a redeploy.
 */
export const GOOGLE_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
