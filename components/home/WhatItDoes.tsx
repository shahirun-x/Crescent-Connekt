import Link from "next/link";
import Shot from "@/components/Shot";
import Figure, { Rise } from "./Figure";
import {
  FEATURE_CALENDAR,
  FEATURE_INSTITUTIONS,
  FEATURE_NETWORK,
} from "@/lib/images";

/**
 * What Crescent Connekt does.
 *
 * Three things, deliberately NOT three equal cards. The Central Calendar is
 * the reason the platform exists, so it gets a large photograph and the top of
 * the section; the directory and the Member Network sit beneath it at half the
 * weight. Three equal columns would say the three are equally important, which
 * is both untrue and the shape every generated feature section takes.
 */
export default function WhatItDoes() {
  return (
    <section className="bg-paper-deep">
      <div className="container-page py-24 md:py-32">
        <Rise>
          <h2 className="type-h1 max-w-[16ch] text-balance text-ink-900">
            What it actually does
          </h2>
        </Rise>

        {/* The feature. Full width, large image, the most space on the page. */}
        <div className="mt-14 grid gap-10 md:mt-16 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16">
          <Figure>
            <figure className="frame-zoom">
              <Shot
                image={FEATURE_CALENDAR}
                className="aspect-[3/2] w-full"
                sizes="(min-width: 1024px) 58vw, 100vw"
              />
            </figure>
          </Figure>

          <Rise delay={0.08}>
            <h3 className="type-h2 text-ink-900">The Central Calendar</h3>
            <p className="type-body mt-5 text-ink-700">
              Sixteen institutions used to publish sixteen calendars, and major
              events landed on the same weekend more often than anyone
              admitted. One shared calendar makes the clash visible before it
              happens.
            </p>
            <p className="type-body mt-4 text-ink-700">
              Filter by institution, category or place, and see the whole
              academic year at once.
            </p>
            <Link href="/calendar" className="link-rule mt-7 inline-block text-ink-900">
              Open the calendar
            </Link>
          </Rise>
        </div>

        {/* The two supporting things, at half the weight. */}
        <div className="mt-20 grid gap-12 border-t border-ink-200 pt-14 md:grid-cols-2 md:gap-14">
          <Secondary
            image={FEATURE_NETWORK}
            title="The Member Network"
            href="/connect"
            cta="Join the Member Network"
          >
            <p className="type-body text-ink-700">
              A members-only directory of students, alumni, faculty and
              well-wishers across every campus and every generation.
            </p>
            <p className="type-body mt-4 text-ink-700">
              Contact details stay hidden unless a member chooses to share
              them, and the directory is never visible to the public web.
            </p>
          </Secondary>

          <Secondary
            image={FEATURE_INSTITUTIONS}
            title="The institutions"
            href="/institutions"
            cta="Browse the directory"
          >
            <p className="type-body text-ink-700">
              Every institution, what it does, when it was founded and where to
              find it — with a link straight out to its own website.
            </p>
            <p className="type-body mt-4 text-ink-700">
              This page supplements those sites. It never replaces them.
            </p>
          </Secondary>
        </div>
      </div>
    </section>
  );
}

function Secondary({
  image,
  title,
  href,
  cta,
  children,
}: {
  image: Parameters<typeof Shot>[0]["image"];
  title: string;
  href: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Figure>
        <figure className="frame-zoom">
          <Shot
            image={image}
            className="aspect-[3/2] w-full"
            sizes="(min-width: 768px) 44vw, 100vw"
          />
        </figure>
      </Figure>
      <Rise delay={0.06}>
        <h3 className="type-h3 mt-7 text-ink-900">{title}</h3>
        <div className="mt-4">{children}</div>
        <Link href={href} className="link-rule mt-6 inline-block text-ink-900">
          {cta}
        </Link>
      </Rise>
    </div>
  );
}
