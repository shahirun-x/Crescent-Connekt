import Link from "next/link";
import Image from "next/image";
import { Rise } from "./Figure";
import type { CrescentEvent } from "@/lib/types";

/**
 * What's on.
 *
 * The next few events as an editorial list, not a rail of cards. A date list
 * is something people already know how to read: day number large on the left,
 * month beneath it, then the event. Hairlines between, nothing around.
 *
 * The old version was a horizontally scrolling strip of image cards, which
 * looked busy, hid most of its content off-screen, and needed a focusable
 * scroll region to stay keyboard-accessible.
 */
export default function WhatsOn({ events }: { events: CrescentEvent[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => (e.date_end ?? e.date_start) >= today)
    .sort((a, b) => a.date_start.localeCompare(b.date_start))
    .slice(0, 4);

  // Nothing upcoming is a real state, not an error — the seed runs out
  // eventually. Silently rendering an empty list would look broken.
  if (upcoming.length === 0) {
    return (
      <section className="bg-paper">
        <div className="container-page py-24 md:py-32">
          <h2 className="type-h1 text-ink-900">What&apos;s on</h2>
          <p className="type-body mt-6 text-ink-700">
            Nothing is scheduled in the shared calendar just now.
          </p>
          <Link href="/calendar" className="link-rule mt-8 inline-block text-ink-900">
            See the full calendar
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper">
      <div className="container-page py-24 md:py-32">
        <Rise>
          <h2 className="type-h1 text-ink-900">What&apos;s on</h2>
        </Rise>

        <ul className="mt-14 border-t border-ink-200">
          {upcoming.map((event, i) => (
            <Rise as="li" key={event.id} delay={0.05 * i}>
              <article className="grid grid-cols-[4.5rem_1fr] items-start gap-5 border-b border-ink-200 py-8 sm:grid-cols-[6rem_1fr] sm:gap-8 md:py-10">
                <EventDate iso={event.date_start} />

                <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
                  <div className="min-w-0 flex-1">
                    <h3 className="type-h3 text-ink-900">{event.title}</h3>
                    <p className="type-meta mt-2.5 text-ink-500">
                      {event.institution_name}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>

                  {/*
                    The image only appears when the event actually has one.
                    A placeholder tile on every row would turn the list back
                    into a grid of cards.
                  */}
                  {event.image_url && (
                    <div className="frame-zoom relative hidden h-24 w-36 shrink-0 overflow-hidden sm:block">
                      <Image
                        src={event.image_url}
                        alt=""
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </article>
            </Rise>
          ))}
        </ul>

        <Rise delay={0.06}>
          <Link href="/calendar" className="link-rule mt-12 inline-block text-ink-900">
            See the full calendar
          </Link>
        </Rise>
      </div>
    </section>
  );
}

/**
 * The date, set as display type.
 *
 * A <time> element so the machine-readable date travels with the visible one.
 * The split day and month are `aria-hidden`, because a screen reader
 * announcing "20" and "Sep" as two unrelated fragments is worse than useless;
 * the readable date is a visually-hidden span instead.
 *
 * NOT `aria-label` on the <time>. <time> maps to no ARIA role, and
 * `aria-label` on a roleless element is prohibited — axe flagged exactly this
 * as `aria-prohibited-attr`, and the label would have been dropped by some
 * screen readers anyway, leaving the date silent.
 */
function EventDate({ iso }: { iso: string }) {
  const d = new Date(`${iso}T00:00:00`);
  const day = d.toLocaleDateString("en-GB", { day: "numeric" });
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  const full = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <time dateTime={iso} className="block">
      <span className="sr-only">{full}</span>
      <span
        aria-hidden="true"
        className="block font-[family-name:var(--font-display)] text-[2.75rem] leading-[0.9] tracking-[-0.03em] text-ink-900 sm:text-[3.5rem]"
      >
        {day}
      </span>
      <span
        aria-hidden="true"
        className="type-meta mt-1.5 block uppercase text-ink-500"
      >
        {month}
      </span>
    </time>
  );
}
