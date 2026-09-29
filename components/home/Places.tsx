import Link from "next/link";
import Shot from "@/components/Shot";
import Figure, { Rise } from "./Figure";
import {
  PLACE_CHENNAI,
  PLACE_KILAKARAI,
  PLACE_MADURAI,
  PLACE_NAGORE,
  type SiteImage,
} from "@/lib/images";
import type { Institution } from "@/lib/types";

/**
 * The institutions, by place. The heart of the page.
 *
 * Four rows, one per town, each a photograph beside a typographic list. Not a
 * grid of sixteen cards: sixteen equal tiles tell you the network is large and
 * nothing else, while four places with names set large tell you where it is
 * and how it is shaped.
 *
 * The map used to live here and has moved to /institutions. A map on the
 * homepage answers "where exactly", which is a second question — this section
 * answers the first one, and a Leaflet bundle is a lot of JavaScript to ship
 * for a question nobody asked yet.
 */

interface Place {
  name: string;
  /** Cities in lib/seed.ts that belong to this place. Client truth, not guessed. */
  cities: string[];
  note: string;
  image: SiteImage;
}

const PLACES: Place[] = [
  {
    name: "Chennai",
    cities: ["Chennai", "Vandalur"],
    note: "Where it started, and where most of it is.",
    image: PLACE_CHENNAI,
  },
  {
    name: "Kilakarai",
    cities: ["Kilakarai"],
    note: "The coastal town the trust has served longest.",
    image: PLACE_KILAKARAI,
  },
  {
    name: "Madurai",
    cities: ["Madurai"],
    note: "Inland, and the newest of the four.",
    image: PLACE_MADURAI,
  },
  {
    name: "Nagore",
    cities: ["Nagore", "Nagapattinam"],
    note: "On the delta coast, east of Thanjavur.",
    image: PLACE_NAGORE,
  },
];

export default function Places({
  institutions,
}: {
  institutions: Institution[];
}) {
  const rows = PLACES.map((place) => ({
    ...place,
    list: institutions.filter((i) => place.cities.includes(i.city)),
  })).filter((r) => r.list.length > 0);

  return (
    <section className="bg-paper">
      <div className="container-page py-24 md:py-32">
        <Rise>
          <h2 className="type-h1 max-w-[18ch] text-balance text-ink-900">
            Four towns. One family of institutions.
          </h2>
        </Rise>

        <div className="mt-16 md:mt-20">
          {rows.map((row, i) => (
            <div
              key={row.name}
              // Hairline between rows, nothing around them. A rule is enough
              // separation; a border on four sides makes a card.
              className="border-t border-ink-200 py-12 first:border-t-0 first:pt-0 md:py-16 md:first:pt-0"
            >
              {/*
                Images alternate sides on desktop. On mobile the photograph is
                always first, because a place you cannot picture is just a word.
              */}
              <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
                <Figure
                  className={i % 2 === 1 ? "md:order-2" : undefined}
                  delay={0.04}
                >
                  <figure className="frame-zoom">
                    <Shot
                      image={row.image}
                      className="aspect-[4/3] w-full"
                      sizes="(min-width: 768px) 45vw, 100vw"
                    />
                  </figure>
                </Figure>

                <div>
                  <Rise>
                    <h3 className="type-place text-ink-900">{row.name}</h3>
                    <p className="type-meta mt-3 text-ink-500">{row.note}</p>
                  </Rise>

                  <ul className="mt-8 divide-y divide-ink-100">
                    {row.list.map((inst, n) => (
                      <Rise as="li" key={inst.id} delay={0.03 * n}>
                        <div className="flex items-center justify-between gap-5">
                          {/*
                            Padding belongs on the anchor, not on this row.
                            On the row it makes a 52px stripe with a 24px
                            target inside it, which measures fine and taps
                            badly.
                          */}
                          <a
                            href={inst.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-[3rem] flex-1 items-center py-3 text-ink-900 transition-colors hover:text-accent-700"
                          >
                            {inst.name}
                          </a>
                          <span className="type-meta shrink-0 text-ink-500">
                            {inst.established_year ?? "—"}
                          </span>
                        </div>
                      </Rise>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Rise delay={0.06}>
          <Link href="/institutions" className="link-rule mt-14 inline-block text-ink-900">
            All sixteen, with the map
          </Link>
        </Rise>
      </div>
    </section>
  );
}
