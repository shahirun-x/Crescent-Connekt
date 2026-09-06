/**
 * WCAG contrast checker for the Crescent Global palette.
 *
 *   node scripts/check-contrast.mjs
 *
 * Every colour pair the design actually uses is listed here with the context
 * it appears in. Exits non-zero if any pair drops below its required ratio, so
 * this can gate a release the same way a test would.
 *
 * Thresholds (WCAG 2.1 AA):
 *   4.5:1  normal text
 *   3.0:1  large text (>=24px, or >=18.66px bold) and UI component boundaries
 *
 * Colours are read from app/globals.css so this cannot drift from the theme.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

const css = readFileSync(
  path.join(process.cwd(), "app", "globals.css"),
  "utf8"
);

/** Pull `--color-name: #hex;` and `--token: #hex;` out of globals.css. */
function readTokens() {
  const map = {};
  for (const m of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    map[m[1].replace(/^color-/, "")] = m[2];
  }
  return map;
}

const T = readTokens();

function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function luminance(hex) {
  const srgb = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** `c("sand-50")` resolves a token; a literal hex passes straight through. */
const c = (name) => {
  if (name.startsWith("#")) return name;
  const v = T[name];
  if (!v) {
    console.error(`✗ unknown token: --${name} (or --color-${name})`);
    process.exit(2);
  }
  return v;
};

const WHITE = "#ffffff";

/** [label, background, foreground, minimum ratio] */
const PAIRS = [
  // --- Semantic text on light surfaces -----------------------------------
  ["text-primary on white", WHITE, "text-primary", 4.5],
  ["text-secondary on white", WHITE, "text-secondary", 4.5],
  ["text-muted on white", WHITE, "text-muted", 4.5],
  ["text-primary on surface-sunken", "surface-sunken", "text-primary", 4.5],
  ["text-secondary on surface-sunken", "surface-sunken", "text-secondary", 4.5],
  ["text-muted on surface-sunken", "surface-sunken", "text-muted", 4.5],
  ["text-primary on surface-warm", "surface-warm", "text-primary", 4.5],
  ["text-secondary on surface-warm", "surface-warm", "text-secondary", 4.5],
  ["text-muted on surface-warm", "surface-warm", "text-muted", 4.5],

  // --- Text on the inverse navy surface ----------------------------------
  ["white on surface-inverse", "surface-inverse", WHITE, 4.5],
  ["muted on surface-inverse", "surface-inverse", "text-on-inverse-muted", 4.5],
  ["white on crescent-950", "crescent-950", WHITE, 4.5],
  ["white on crescent-800", "crescent-800", WHITE, 4.5],
  ["white on crescent-700", "crescent-700", WHITE, 4.5],

  // --- Sand section grounds ----------------------------------------------
  ["crescent-800 on sand-50", "sand-50", "crescent-800", 4.5],
  ["crescent-800 on sand-100", "sand-100", "crescent-800", 4.5],
  ["crescent-700 on sand-100", "sand-100", "crescent-700", 4.5],
  ["sand-700 label on sand-50", "sand-50", "sand-700", 4.5],
  ["sand-800 on sand-200", "sand-200", "sand-800", 4.5],

  // --- Teal secondary ----------------------------------------------------
  ["teal-700 on white", WHITE, "teal-700", 4.5],
  ["teal-700 on teal-50", "teal-50", "teal-700", 4.5],
  ["teal-800 on teal-100", "teal-100", "teal-800", 4.5],
  ["white on teal-700", "teal-700", WHITE, 4.5],
  ["white on teal-800", "teal-800", WHITE, 4.5],
  ["teal-300 on crescent-900 (dark accent)", "crescent-900", "teal-300", 4.5],

  // --- Gold highlight ----------------------------------------------------
  ["gold-700 on white", WHITE, "gold-700", 4.5],
  ["gold-700 on gold-50", "gold-50", "gold-700", 4.5],
  ["gold-800 on gold-100", "gold-100", "gold-800", 4.5],
  ["gold-800 on sand-100", "sand-100", "gold-800", 4.5],
  ["gold-300 on crescent-900 (dark eyebrow)", "crescent-900", "gold-300", 4.5],
  ["gold-200 on crescent-950", "crescent-950", "gold-200", 4.5],

  // --- Accent red --------------------------------------------------------
  ["accent-600 on white", WHITE, "accent-600", 4.5],
  ["accent-700 on accent-50", "accent-50", "accent-700", 4.5],
  ["accent-300 on crescent-900", "crescent-900", "accent-300", 4.5],

  // --- Non-text: UI component boundaries (WCAG 1.4.11, 3:1) --------------
  //
  // Only boundaries needed to IDENTIFY a control are in scope. A card outline
  // or a section divider is decorative and exempt, which is why
  // --border-subtle / --border-default are not listed here. Form input
  // borders ARE in scope and use --border-interactive.
  ["input border on white", WHITE, "border-interactive", 3.0],
  ["input border on surface-warm", "surface-warm", "border-interactive", 3.0],
  ["input border on surface-sunken", "surface-sunken", "border-interactive", 3.0],
  ["focus ring on white", WHITE, "crescent-500", 3.0],
  ["focus ring on sand-100", "sand-100", "crescent-500", 3.0],
  ["focus ring on sand-50", "sand-50", "crescent-500", 3.0],
  ["white focus ring on crescent-900", "crescent-900", WHITE, 3.0],
];

let failures = 0;
const rows = [];

for (const [label, bgName, fgName, min] of PAIRS) {
  const bg = c(bgName);
  const fg = c(fgName);
  const r = ratio(bg, fg);
  const ok = r >= min;
  if (!ok) failures++;
  rows.push({ label, bg, fg, r, min, ok });
}

const w = Math.max(...rows.map((r) => r.label.length));
for (const r of rows) {
  console.log(
    `${r.ok ? "PASS" : "FAIL"}  ${r.r.toFixed(2).padStart(5)}:1  (min ${r.min})  ` +
      `${r.label.padEnd(w)}  ${r.bg} / ${r.fg}`
  );
}

console.log(
  `\n${rows.length} pairs checked, ${failures} failure(s) against WCAG AA.`
);
process.exit(failures > 0 ? 1 : 0);
