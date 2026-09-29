import type { Metadata } from "next";
import Link from "next/link";
import TimelineScroll from "@/components/about/TimelineScroll";
import { getInstitutions, getTimeline } from "@/lib/data";
import type { Institution } from "@/lib/types";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Crescent Connekt exists, the two trusts behind the sixteen institutions, and the story from one school in 1968 to today.",
  alternates: { canonical: "/about" },
};

export const revalidate = 86400;

/**
 * About.
 *
 * Deliberately short — it supports the homepage rather than competing with it:
 * what the platform is, who the institutions belong to, and the history.
 *
 * The previous version carried the CGOM strategy document — vision, mission,
 * the strategic streams, the School-to-Start-up continuum. That is a separate
 * organisation's programme and was removed rather than relabelled; see
 * docs/DECISIONS.md #30.
 */
export default async function AboutPage() {
  const [timeline, institutions] = await Promise.all([
    getTimeline(),
    getInstitutions(),
  ]);

  const byTrust = groupByTrust(institutions);

  return (
    <>
      {/* Opening statement. No image, no eyebrow — plain and direct. */}
      <section className="border-b border-slate-200 bg-sand-50">
        <div className="container-page py-20 md:py-28">
          <h1 className="type-display max-w-4xl text-balance text-crescent-900">
            Sixteen institutions. One place to find each other.
          </h1>
          <p className="type-lead mt-8 text-slate-600">
            The Crescent family has grown across four towns and nearly six
            decades. Each institution runs itself, publishes its own calendar
            and keeps its own records — which is exactly how it should be, and
            exactly why it became hard to see the whole.
          </p>
          <p className="type-lead mt-5 text-slate-600">
            Crescent Connekt is the layer above them. One shared calendar, so
            major events stop clashing. One directory, so a student in Madurai
            can find an alumnus in Chennai. One place that points outward to
            every institution&apos;s own site and never tries to replace it.
          </p>
        </div>
      </section>

      {/* The two trusts. A typographic list, not a grid of cards. */}
      <section className="border-b border-slate-200">
        <div className="container-page py-20 md:py-28">
          <h2 className="type-h2 max-w-2xl text-balance text-crescent-900">
            Two trusts, one family
          </h2>
          <p className="type-body mt-5 text-slate-600">
            Every institution here is governed by one of two trusts. Crescent
            Connekt coordinates between them; it governs nothing.
          </p>

          <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-20">
            {byTrust.map(([trust, list]) => (
              <div key={trust}>
                <h3 className="type-h3 text-crescent-900">{trust}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {list.length} institution{list.length === 1 ? "" : "s"}
                </p>

                <ul className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
                  {list.map((inst) => (
                    <li
                      key={inst.id}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
                    >
                      <span className="text-crescent-900">
                        {inst.external_url ? (
                          <a
                            href={inst.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-accent-500/50 underline-offset-4 transition-colors hover:text-accent-700"
                          >
                            {inst.name}
                          </a>
                        ) : (
                          inst.name
                        )}
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-slate-600">
                        {inst.city}
                        {inst.established_year
                          ? ` \u00b7 ${inst.established_year}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            href="/institutions"
            className="mt-12 inline-block border-b-2 border-accent-500 pb-1 text-crescent-900 transition-colors hover:text-accent-700"
          >
            Browse the full directory
          </Link>
        </div>
      </section>

      {/* History. Data-driven; the timeline carries no CGOM framing. */}
      <section className="bg-sand-50">
        <div className="container-page py-20 md:py-28">
          <h2 className="type-h2 max-w-2xl text-balance text-crescent-900">
            From one school in Chetpet, 1968
          </h2>
          <p className="type-body mt-5 text-slate-600">
            A single school, founded by Alhaj B.S. Abdur Rahman, moved to
            Vandalur in 1971. Everything since has grown from it.
          </p>

          <div className="mt-14">
            <TimelineScroll entries={timeline} />
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * Group institutions under their governing trust, largest group first.
 *
 * Trust names are client-supplied truth from the official directory card and
 * are not normalised or "corrected" here (CLAUDE.md rule 6).
 */
function groupByTrust(institutions: Institution[]): [string, Institution[]][] {
  const map = new Map<string, Institution[]>();
  for (const inst of institutions) {
    const trust = inst.parent_org?.trim() || "Other institutions";
    if (!map.has(trust)) map.set(trust, []);
    map.get(trust)!.push(inst);
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}
