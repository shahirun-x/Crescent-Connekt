import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Places from "@/components/home/Places";
import WhatItDoes from "@/components/home/WhatItDoes";
import WhatsOn from "@/components/home/WhatsOn";
import Heritage from "@/components/home/Heritage";
import MemberInvite from "@/components/home/MemberInvite";
import { Rise } from "@/components/home/Figure";
import { HERO_SLIDES } from "@/lib/images";
import { getEvents, getInstitutions } from "@/lib/data";

/**
 * The layout's default title runs to 66 characters, which Google truncates.
 * `absolute` bypasses the "%s · Crescent Connekt" template so the homepage
 * gets a title that fits, while the full tagline stays as the OG title for
 * social cards, where the length limit is far more generous.
 */
export const metadata: Metadata = {
  title: { absolute: "Crescent Connekt — One Network, Sixteen Institutions" },
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

/**
 * Homepage.
 *
 * Rebuilt from the content up rather than restyled. The previous version ran
 * eight sections through one formula — eyebrow, heading, grey subheading, card
 * grid — which is why adding colour, texture and dividers to it kept making it
 * busier without making it better.
 *
 *   1  Hero            full-bleed photograph, headline bottom-left
 *   2  Opening         one paragraph, serif, narrow column, no image
 *   3  Places          four towns, photo beside a typographic list
 *   4  What it does    one large feature, two smaller beneath
 *   5  What's on       dated editorial list
 *   6  Heritage        the one dark band
 *   7  Member invite   one photograph, one action
 *   8  Footer          (app/layout.tsx)
 *
 * Gone with the old structure: the pillars grid, the audiences list, the
 * homepage timeline and the map. The map moved to /institutions — it answers
 * "where exactly", which is a second question, and it is a lot of JavaScript
 * to ship before anybody has asked it.
 */
export default async function HomePage() {
  const [institutions, events] = await Promise.all([
    getInstitutions(),
    getEvents(),
  ]);

  return (
    <>
      <Hero slides={HERO_SLIDES} />

      {/* 2 — OPENING STATEMENT. No image, no eyebrow, no heading. */}
      <section className="bg-paper">
        <div className="container-page py-24 md:py-32">
          <Rise>
            <p className="type-statement text-ink-900">
              Crescent Connekt is one place to see sixteen institutions at
              once — a shared calendar, a member directory, and a route out to
              each institution&apos;s own site. It{" "}
              <em className="not-italic text-accent-700">supplements</em>. It
              never replaces.
            </p>
          </Rise>
        </div>
      </section>

      <Places institutions={institutions} />
      <WhatItDoes />
      <WhatsOn events={events} />
      <Heritage />
      <MemberInvite />
    </>
  );
}
