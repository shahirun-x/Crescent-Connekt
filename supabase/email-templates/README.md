# Email templates

Replacements for the default Supabase-branded auth emails, plus the Resend
approval notification.

**These are not applied automatically.** Paste them in by hand:

| File | Where it goes |
|---|---|
| `confirm-signup.html` | Supabase → Authentication → Emails → **Confirm signup** |
| `reset-password.html` | Supabase → Authentication → Emails → **Reset password** |
| `magic-link.html` | Supabase → Authentication → Emails → **Magic Link** |
| `approval-notification.html` | Used by `app/api/admin/members/[id]/status/route.ts` (Resend) |

## Why they look the way they do

Email clients are not browsers. Outlook renders with Word's HTML engine, Gmail
strips `<style>` blocks in some contexts, and none of them can be relied on for
flexbox, grid, or external CSS. So:

- **Tables for layout**, not divs. This is the one place that is still correct.
- **Inline styles only.** No `<style>` block, no classes, no external CSS.
- **No web fonts.** A system font stack, matching the site.
- **No images.** The emblem is drawn with a styled table cell rather than an
  `<img>`, because most clients block remote images by default and a broken
  logo is worse than no logo. It also keeps these self-contained.
- **600px max width**, the safe standard.
- Colours are the site's tokens as literal hex, since CSS variables do not
  survive email clients: crescent-700 `#1a3a6b`, crescent-800 `#142d54`,
  accent-500 `#d7263d`, slate-600 `#475569`.
- Every template has a **plain-text fallback URL** below the button. Some
  clients strip anchor styling, and some people copy links rather than click.

## Supabase template variables

Supabase substitutes these server-side. They must be spelled exactly:

- `{{ .ConfirmationURL }}` — the action link (all three auth templates)
- `{{ .SiteURL }}` — your configured Site URL
- `{{ .Email }}` — the recipient's address
- `{{ .Token }}` — the 6-digit OTP, if you use codes instead of links

`{{ .ConfirmationURL }}` already points at the redirect configured in the
Supabase dashboard. For this project that must be
`https://<your-domain>/connect/callback`.

## Approval notification

`approval-notification.html` is for Resend, not Supabase, so it uses different
placeholders. Substitute them in the route before sending:

- `{{FULL_NAME}}` — the member's name
- `{{DIRECTORY_URL}}` — absolute link to `/connect/directory`

The route currently sends a plain-text body. Switching it to this HTML means
passing `html:` instead of `text:` in the Resend payload — keep a `text:`
version alongside it, since some clients and most spam filters prefer a
multipart message.
