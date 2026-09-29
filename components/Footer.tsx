import Link from "next/link";
import Logo from "./Logo";
import { nav, site } from "@/lib/site";
import { getInstitutions } from "@/lib/data";
import type { Institution } from "@/lib/types";

/**
 * Footer.
 *
 * Generous and calm rather than dense: the wordmark and tagline stand alone at
 * the top, then the institutions grouped under the trust that governs them,
 * then navigation and contact. Grouping by trust is the point — it is the one
 * place on the site that shows the whole network and its ownership at a
 * glance, and it gives every institution an outbound link from every page.
 *
 * A server component so it can read the institution list. It is rendered on
 * every route, so nothing here may be interactive enough to need hydration.
 */
export default async function Footer() {
  const institutions = await getInstitutions();
  const byTrust = groupByTrust(institutions);

  return (
    <footer className="mt-auto bg-crescent-950 text-crescent-100">
      <div className="container-page py-20 md:py-24">
        {/* Wordmark and tagline, alone, with room around them. */}
        <Logo mono withTagline size="text-[1.75rem]" />

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
          <div>
            <h2 className="type-meta uppercase tracking-[0.16em] text-crescent-300">
              The institutions
            </h2>
            <div className="mt-7 grid gap-10 sm:grid-cols-2">
              {byTrust.map(([trust, list]) => (
                <div key={trust}>
                  <h3 className="font-[family-name:var(--font-display)] text-[1.0625rem] text-white">
                    {trust}
                  </h3>
                  <ul className="mt-2">
                    {list.map((inst) => (
                      <li key={inst.id}>
                        <a
                          href={inst.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-[2.75rem] items-center text-sm leading-snug text-crescent-200 transition-colors hover:text-white"
                        >
                          {inst.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-10 min-[520px]:grid-cols-2 lg:grid-cols-1 lg:gap-12 xl:grid-cols-2">
            <div>
              <h2 className="type-meta uppercase tracking-[0.16em] text-crescent-300">
                This site
              </h2>
              <ul className="mt-4">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex min-h-[2.75rem] items-center text-sm text-crescent-200 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="type-meta uppercase tracking-[0.16em] text-crescent-300">
                Contact
              </h2>
              <ul className="mt-7 space-y-2.5 text-sm text-crescent-200">
                <li>
                  {/*
                    `break-words`: the address is a single unbreakable token,
                    and at 1024px this column is narrower than it is. Without
                    this the whole document scrolled sideways by 27px.
                  */}
                  <a
                    href={`mailto:${site.contactEmail}`}
                    className="flex min-h-[2.75rem] items-center break-words transition-colors hover:text-white"
                  >
                    {site.contactEmail}
                  </a>
                </li>
                <li className="leading-relaxed">
                  Crescent Campus, Vandalur,
                  <br />
                  Chennai 600048, India
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="flex min-h-[2.75rem] items-center transition-colors hover:text-white"
                  >
                    Send a message
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-7 text-xs text-crescent-200 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <p>
            Supplements — it does not replace — the official website of each
            institution.
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Group by governing trust, largest group first.
 *
 * Trust names come from the official directory card and are client truth —
 * not normalised or "corrected" here (CLAUDE.md rule 6).
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
