import Link from "next/link";
import Image from "next/image";
import { RevealGroup, RevealItem } from "./Reveal";
import SectionHeading from "./SectionHeading";
import { formatDateRange } from "@/lib/site";
import { eventCategoryBorderL } from "@/lib/eventCategories";
import type { CrescentEvent } from "@/lib/types";

export default function EventsStrip({ events }: { events: CrescentEvent[] }) {
  const upcoming = events
    .filter((e) => new Date((e.date_end ?? e.date_start) + "T23:59:59") >= new Date())
    .slice(0, 6);

  const list = upcoming.length ? upcoming : events.slice(0, 6);

  return (
    <section className="relative isolate border-y border-sand-200 bg-sand-100 py-20 lg:py-24">
      <div aria-hidden="true" className="texture-dots pointer-events-none absolute inset-0 -z-10" />
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="What's Happening Across Crescent"
            title="Upcoming across the network"
            description="Pulled live from the Central Calendar — the coordination layer that keeps events from clashing and participation high."
          />
          <Link
            href="/calendar"
            className="rounded-full border border-crescent-300 px-4 py-2 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50"
          >
            Open Central Calendar →
          </Link>
        </div>

        <RevealGroup as="ul" className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <RevealItem key={e.id} as="li">
              <article
                className={`flex h-full flex-col overflow-hidden rounded-card border border-l-4 border-slate-200 bg-white ${eventCategoryBorderL[e.category]}`}
              >
                {e.image_url && (
                  <div className="relative aspect-video w-full bg-slate-100">
                    <Image
                      src={e.image_url}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-crescent-600">
                  <time dateTime={e.date_start}>
                    {formatDateRange(e.date_start, e.date_end)}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{e.category}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-crescent-800">
                  {e.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{e.institution_name}</p>
                <p className="mt-3 line-clamp-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-500">
                  {e.description}
                </p>
                <p className="mt-3 text-xs text-slate-500">{e.location}</p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
