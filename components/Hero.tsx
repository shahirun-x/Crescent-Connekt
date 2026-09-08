"use client";

import Link from "next/link";
import Image from "next/image";
import { HERO_CAMPUS } from "@/lib/images";
import { motion, useScroll, useTransform } from "framer-motion";

const STATS = [
  { k: "1968", v: "Founded in Chennai" },
  { k: "16", v: "Institutions in the network" },
  { k: "5", v: "Ecosystem pillars" },
  { k: "Global", v: "Alumni across continents" },
];

/**
 * Homepage hero — full-bleed editorial.
 *
 * Two things were wrong before and are deliberately not coming back:
 *
 *  1. The stats were frosted-glass panels (bg-white/10 + backdrop-blur)
 *     floating over the photograph with no relationship to it. They are now a
 *     band along the bottom edge, separated by hairlines — part of the
 *     composition rather than objects on top of it.
 *
 *  2. The scrim was a flat crescent-900/80 across the whole image, which made
 *     the photograph muddy and pointless — if you dim everything evenly you
 *     may as well not have a photo. It is now DIRECTIONAL: near-opaque behind
 *     the headline on the left, clearing to almost nothing on the right so the
 *     image is actually visible where no text sits.
 */
export default function Hero() {
  // Lightweight parallax — the background image drifts as the page scrolls.
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 80]);

  return (
    <section className="relative overflow-hidden bg-crescent-950 text-white">
      {/* Background photograph */}
      <motion.div
        style={{ y }}
        aria-hidden
        className="absolute inset-x-0 -top-24 z-0 h-[calc(100%+12rem)]"
      >
        <Image
          src={HERO_CAMPUS.src as string}
          alt={HERO_CAMPUS.alt}
          fill
          priority={HERO_CAMPUS.priority}
          sizes="100vw"
          className="hero-kenburns object-cover"
        />
      </motion.div>

      {/*
        Directional scrim. Horizontal on wide screens so the right side stays
        legible as a photograph; vertical on mobile, where text spans the full
        width and a left-right ramp would put pale type over a bright sky.
      */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-gradient-to-b from-crescent-950/92 via-crescent-950/75 to-crescent-950/88 lg:bg-gradient-to-r lg:from-crescent-950/95 lg:via-crescent-950/70 lg:to-crescent-950/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(46rem 26rem at 8% 0%, rgba(47,87,166,0.5), transparent 62%), radial-gradient(34rem 22rem at 104% 88%, rgba(13,118,112,0.4), transparent 62%)",
        }}
      />

      <div className="container-page relative z-20">
        <div className="max-w-4xl pb-14 pt-20 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32">
          {/*
            Eyebrow is a rule plus small caps — no pill, no border, no
            translucent chip. Institutional rather than app-like.
          */}
          <p className="type-eyebrow flex items-center gap-3 text-gold-300">
            <span aria-hidden="true" className="h-px w-8 bg-gold-300/70" />
            The Crescent ecosystem, unified
          </p>

          {/* The headline dominates: type-display tops out at 4rem. */}
          <h1 className="type-display mt-6 text-balance">
            One Crescent.
            <br />
            One Community.
            <br />
            <span className="text-gold-300">One Global Network.</span>
          </h1>

          <p className="type-lead mt-7 text-crescent-100">
            A unified academic ecosystem connecting the schools, colleges,
            university, hospitals and community initiatives of the Crescent
            family — channelling their collective effort into education,
            innovation and global impact.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/institutions"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-crescent-900 transition-colors hover:bg-crescent-50"
            >
              Explore Institutions
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center justify-center rounded-full border border-white/45 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View Central Calendar
            </Link>
          </div>
        </div>
      </div>

      {/*
        Stats band along the bottom edge. Hairline dividers, numbers large,
        labels small beneath — a measured rule, not four floating boxes.
        Wraps to 2x2 on narrow screens rather than cramming four columns.
      */}
      <div className="relative z-20 border-t border-white/15">
        <div className="container-page">
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.v}
                className={`py-6 lg:py-7 ${
                  // Left hairline on every item except the first in its row.
                  i % 2 === 1 ? "border-l border-white/15 pl-5" : "pr-5"
                } ${i >= 2 ? "border-t border-white/15 lg:border-t-0" : ""} ${
                  i > 0 ? "lg:border-l lg:border-white/15 lg:pl-6" : ""
                }`}
              >
                <dt className="sr-only">{s.v}</dt>
                <dd>
                  <span className="block text-3xl font-extrabold leading-none tracking-tight text-white sm:text-4xl">
                    {s.k}
                  </span>
                  {/* crescent-100 on crescent-950 is 14.6:1 */}
                  <span className="mt-2 block text-xs font-medium leading-snug text-crescent-100">
                    {s.v}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
