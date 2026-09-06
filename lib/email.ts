import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Email helpers for the Resend notifications.
 *
 * Templates are read from supabase/email-templates/ at runtime rather than
 * duplicated into a TypeScript string. That keeps one source of truth: the
 * same file the human pastes into a dashboard is the one the app sends.
 *
 * The directory is pulled into the serverless bundle by
 * `outputFileTracingIncludes` in next.config.ts — Next's dependency tracer
 * cannot see a path built at runtime, so without that entry the read would
 * succeed locally and throw ENOENT in production.
 */

const TEMPLATE_DIR = path.join(
  process.cwd(),
  "supabase",
  "email-templates"
);

// Templates never change between requests, so read each one once per instance.
const cache = new Map<string, string>();

async function loadTemplate(name: string): Promise<string | null> {
  const cached = cache.get(name);
  if (cached) return cached;

  try {
    const html = await readFile(path.join(TEMPLATE_DIR, `${name}.html`), "utf8");
    cache.set(name, html);
    return html;
  } catch (e) {
    console.error(`[email] Could not read template "${name}"`, e);
    return null;
  }
}

/**
 * Escape a value before it goes into HTML.
 *
 * Member names are already stripped of angle brackets on write, but a template
 * placeholder is a direct injection point and should not depend on a guarantee
 * made somewhere else.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (out, [key, value]) =>
      out.replaceAll(`{{${key}}}`, escapeHtml(value)),
    template
  );
}

export interface ApprovalEmail {
  subject: string;
  html?: string;
  text: string;
}

/**
 * Build the "your profile is approved" message.
 *
 * Always returns a text part. The HTML part is added only when the template
 * loads — if it cannot be read, the member still gets a readable email rather
 * than nothing. Sending both is deliberate: a multipart message fares better
 * with spam filters than HTML alone, and some clients render text by choice.
 */
export async function buildApprovalEmail(
  fullName: string,
  directoryUrl: string
): Promise<ApprovalEmail> {
  const text = `Assalamu alaikum ${fullName},

Your Crescent Connect profile has been reviewed and approved. You can now browse the member directory and find students, alumni, faculty, management, parents, entrepreneurs and well-wishers from across the Crescent network.

Your contact details stay private unless you chose to share them — you can change that any time from your profile.

Open the directory: ${directoryUrl}

— Crescent Global Outreach Mission`;

  const template = await loadTemplate("approval-notification");
  const html = template
    ? fill(template, { FULL_NAME: fullName, DIRECTORY_URL: directoryUrl })
    : undefined;

  return {
    subject: "Your Crescent Connect profile is approved",
    html,
    text,
  };
}
