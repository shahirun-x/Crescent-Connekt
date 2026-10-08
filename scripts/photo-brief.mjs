/**
 * Generates docs/PHOTO_BRIEF.md from lib/images.ts.
 *
 *   npm run photo:brief
 *
 * Written rather than hand-maintained so the shot list can never disagree with
 * the slots the site actually renders. `lib/images.ts` stays the single source
 * of truth; this is a view of it a photographer can read on paper.
 *
 * It parses the TypeScript with a small regex reader instead of importing it,
 * because importing a .ts module from a plain Node script means a build step,
 * and the file is a flat list of object literals with no logic in it.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "lib", "images.ts");
const OUT = path.join(process.cwd(), "docs", "PHOTO_BRIEF.md");

const src = readFileSync(SRC, "utf8");

/** Resolve `A + "..." + B` concatenations and the shared PLACE_AVOID const. */
function literal(raw, consts) {
  return raw
    .split("+")
    .map((part) => {
      const t = part.trim();
      const m = t.match(/^"((?:[^"\\]|\\.)*)"$/);
      if (m) return m[1].replace(/\\"/g, '"').replace(/\\n/g, " ");
      return consts[t] ?? "";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

// Shared string constants declared in the file (currently just PLACE_AVOID).
const consts = {};
for (const m of src.matchAll(
  /^const ([A-Z_]+) =\s*([\s\S]*?);\s*$/gm
)) {
  consts[m[1]] = literal(m[2], {});
}

const slots = [];
for (const m of src.matchAll(
  /export const ([A-Z_]+): SiteImage = \{([\s\S]*?)\n\};/g
)) {
  const [, name, body] = m;
  const field = (key) => {
    const f = body.match(new RegExp(`\\n  ${key}:\\s*([\\s\\S]*?),\\n  [a-zA-Z]`));
    return f ? literal(f[1], consts) : "";
  };
  slots.push({
    name,
    where: field("where"),
    crop: field("crop"),
    brief: field("brief"),
    avoid: field("avoid"),
    minResolution: field("minResolution"),
    hasPhoto: /\n  src:/.test(body),
    isReal: /\n  placeholder:\s*false/.test(body),
  });
}

if (slots.length === 0) {
  console.error("✗ no slots parsed from lib/images.ts — did its shape change?");
  process.exit(2);
}

const homepage = slots.filter((s) => /Homepage/.test(s.where));
const other = slots.filter((s) => !/Homepage/.test(s.where));

const section = (title, list) =>
  [
    `## ${title}`,
    "",
    ...list.map((s) =>
      [
        `### \`${s.name}\``,
        "",
        s.isReal
          ? "**Currently:** authentic Crescent photography in place."
          : s.hasPhoto
          ? "**Currently:** a stand-in photograph. It is not of a Crescent institution and must be replaced."
          : "**Currently:** no photograph. The slot renders a flat toned block, on purpose — nothing honest was available, and a wrong picture is worse than none.",
        "",
        `- **Where it appears** — ${s.where}`,
        `- **Orientation and crop** — ${s.crop}`,
        `- **What to capture** — ${s.brief}`,
        `- **What to avoid** — ${s.avoid}`,
        `- **Minimum resolution** — ${s.minResolution}`,
        "",
      ].join("\n")
    ),
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
over the frame it belongs to. Walk the page top to bottom and you have walked
the shot list in order, at the size and crop each picture will actually be used.

## The one rule

**Authentic photographs of the actual campuses matter more than technical
polish.** A slightly soft frame of the real Vandalur gate with real students
walking through it is worth more than a perfectly lit photograph of somewhere
else. Every stand-in currently on the site is a stock photograph of somewhere
that is not a Crescent institution, and every one of them is a placeholder.

A corollary: **people must be in the frame.** An empty campus photographs a
building. This network is not a building.

## What is missing entirely

${slots.filter((s) => !s.hasPhoto).map((s) => `- \`${s.name}\``).join("\n")}

These slots have no photograph at all and render a flat toned block instead.
Four of them are the places themselves — Chennai, Kilakarai, Madurai and
Nagore — and they are the highest priority on this list. Nobody else can take
them.

${section("Homepage", homepage)}
${section("Other pages", other)}

## Delivering

- Straight out of the camera, unretouched and uncropped. The site crops per
  slot, and a pre-cropped file removes that freedom.
- Colour: the page applies its own treatment, including the black and white on
  the heritage band. Do not pre-convert.
- Name each file after the slot it is for, e.g. \`HERO.jpg\`, \`PLACE_MADURAI.jpg\`.
- Model releases for anyone identifiable, students especially.
`;

writeFileSync(OUT, doc, "utf8");
console.log(
  `✓ docs/PHOTO_BRIEF.md — ${slots.length} slots (${
    slots.filter((s) => !s.hasPhoto).length
  } with no photograph)`
);
