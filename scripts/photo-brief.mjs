/**
 * Generates docs/PHOTO_BRIEF.md from lib/images.ts.
 *
 *   npm run photo:brief
 *
 * Written rather than hand-maintained so the shot list can never disagree with
 * the slots the site actually renders. `lib/images.ts` stays the single source
 * of truth; this is a view of it a photographer can read on paper.
 *
 * It IMPORTS lib/images.ts rather than regex-parsing it. Node 24 strips
 * TypeScript types natively; the two things it cannot do on its own — the
 * `@/` path alias and `.webp` static imports — are handled by a tiny loader
 * hook registered below. No new dependency: `module.register` is built in.
 */

import { register } from "node:module";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = pathToFileURL(process.cwd() + path.sep).href;

// Loader hooks, inline. `@/x` → <root>/x(.ts); `*.webp` → a stand-in for the
// StaticImageData Next would produce, carrying the public URL path.
const hooks = `
const root = ${JSON.stringify(root)};
export async function resolve(spec, ctx, next) {
  if (spec.startsWith("@/")) {
    const rel = spec.slice(2);
    const url = new URL(rel, root).href;
    if (/\\.[a-z]+$/i.test(rel)) return { url, shortCircuit: true };
    return { url: url + ".ts", shortCircuit: true };
  }
  return next(spec, ctx);
}
export async function load(url, ctx, next) {
  if (url.endsWith(".webp")) {
    const pub = url.slice(url.indexOf("/public/") + "/public".length);
    return {
      format: "module",
      shortCircuit: true,
      source: "export default " + JSON.stringify({ src: pub }),
    };
  }
  return next(url, ctx);
}`;
register("data:text/javascript," + encodeURIComponent(hooks));

const { ALL_IMAGES } = await import(new URL("lib/images.ts", root).href);

const OUT = path.join(process.cwd(), "docs", "PHOTO_BRIEF.md");

const slots = Object.entries(ALL_IMAGES).map(([name, img]) => ({
  name: name.replace(/^INSTITUTION:/, ""),
  isInstitution: name.startsWith("INSTITUTION:"),
  ...img,
  files: [img.desktop?.src, img.mobile?.src].filter(Boolean),
  status:
    img.desktop || img.mobile
      ? img.desktop && img.mobile
        ? "client photograph — desktop and mobile crops"
        : img.desktop
          ? "client photograph — desktop crop only (phones crop it at the focal point)"
          : "client photograph — mobile crop only (desktop crops it at the focal point)"
      : img.src
        ? "STAND-IN — not a Crescent photograph; must be replaced"
        : "NO PHOTOGRAPH — renders a flat toned block",
}));

const missing = slots.filter((s) => !s.desktop && !s.mobile);
const halfPairs = slots.filter((s) => !!s.desktop !== !!s.mobile);

const entry = (s) =>
  [
    `### \`${s.name}\``,
    "",
    `**Currently:** ${s.status}.${s.files.length ? ` Files: ${s.files.map((f) => `\`${f}\``).join(", ")}.` : ""}${s.focal ? ` Focal point: \`${s.focal}\`.` : ""}`,
    "",
    `- **Where it appears** — ${s.where}`,
    `- **Orientation and crop** — ${s.crop}`,
    `- **What to capture** — ${s.brief}`,
    `- **What to avoid** — ${s.avoid}`,
    `- **Minimum resolution** — ${s.minResolution}`,
    "",
  ].join("\n");

const doc = `# Photography brief — Crescent Connekt

<!--
  GENERATED FILE. Do not edit by hand.
  Run \`npm run photo:brief\` after changing lib/images.ts.
-->

Every photograph on the site is one named slot in \`lib/images.ts\`. This is
that list, written for whoever is holding the camera.

**See any slot on the live site.** Add \`?shots=1\` to a page — for the homepage,
<https://crescent-global-calender.vercel.app/?shots=1> — and each brief appears
over the frame it belongs to.

## The one rule

**Authentic photographs of the actual campuses matter more than technical
polish.** People must be in the frame where they can be — an empty campus
photographs a building, and this network is not a building.

## Still missing — no client photograph

${missing.map((s) => `- \`${s.name}\` — ${s.status}`).join("\n")}

The heritage band is the most valuable of these: a genuine archival photograph
from 1968–1971 has to be found, not shot.

## Half pairs — one crop only

A second crop would let the site stop cropping these to fit the other frame.

${halfPairs.map((s) => `- \`${s.name}\` — ${s.desktop ? "needs a 4:5 portrait for phones" : "needs a 16:9 landscape for desktop"}`).join("\n")}

## Homepage

${slots.filter((s) => /^Homepage/.test(s.where) && !s.isInstitution).map(entry).join("\n")}

## Institutions

${slots.filter((s) => s.isInstitution).map(entry).join("\n")}

## Other pages

${slots.filter((s) => !/^Homepage/.test(s.where)).map(entry).join("\n")}

## Delivering

- Straight out of the camera, unretouched and uncropped. The site crops per
  slot, and a pre-cropped file removes that freedom.
- Colour: the page applies its own treatment, including the black and white on
  the heritage band. Do not pre-convert.
- Name each file \`<subject>-desktop.webp\` / \`<subject>-mobile.webp\`, where
  \`<subject>\` is the slot name above.
- Model releases for anyone identifiable, students especially.
`;

writeFileSync(OUT, doc, "utf8");
console.log(
  `✓ docs/PHOTO_BRIEF.md — ${slots.length} slots, ${missing.length} without a client photograph, ${halfPairs.length} with one crop only`
);
