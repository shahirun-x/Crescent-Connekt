"use client";

import Link from "next/link";
import Image from "next/image";
import { HERO_CAMPUS } from "@/lib/images";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  // Lightweight parallax — the background image drifts as the page scrolls.
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 80]);

  return (
    <section className="relative overflow-hidden bg-crescent-900 text-white">
      {/* z-0: parallax background photo */}
      <motion.div
        style={{ y }}
        aria-hidden
        className="absolute inset-x-0 -top-24 z-0 h-[calc(100%+12rem)]"
      >
        <Image
          src={HERO_CAMPUS.src}
          alt={HERO_CAMPUS.alt}
          fill
          priority={HERO_CAMPUS.priority}
          sizes="100vw"
          /* Ken Burns: a very slow zoom so the hero is never quite still.
             1.0 -> 1.08 over 24s. Frozen under prefers-reduced-motion by the
             global rule in globals.css. */
          className="hero-kenburns object-cover"
        />
      </motion.div>
      {/* z-10: dim the photo so white text stays readable */}
      <div aria-hidden className="absolute inset-0 z-10 bg-crescent-900/80" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(60rem 30rem at 15% -10%, rgba(255,255,255,0.25), transparent), radial-gradient(40rem 24rem at 110% 20%, rgba(215,38,61,0.35), transparent)",
        }}
      />
      {/* z-20: content */}
      <div className="container-page relative z-20 grid gap-10 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
            The Crescent ecosystem, unified
          </p>
          <p className="mb-4 mt-3 max-w-lg text-sm font-medium text-crescent-100">
            A structured School-to-Start-up continuum — from Learning to
            Leadership, from Knowledge to Innovation.
          </p>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            One Crescent.
            <br />
            One Community.
            <br />
            <span className="text-crescent-200">One Global Network.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-crescent-100">
            A unified academic ecosystem connecting schools, colleges,
            university, hospitals and community initiatives of the Crescent
            family — channelling their collective efforts into education,
            innovation, entrepreneurship and global impact.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/institutions"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-crescent-800 transition-colors hover:bg-crescent-50"
            >
              Explore Institutions
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View Central Calendar
            </Link>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-4 text-sm">
          {[
            { k: "1968", v: "Founded in Chennai" },
            { k: "16+", v: "Institutions in the network" },
            { k: "5", v: "Ecosystem pillars" },
            { k: "Global", v: "Alumni across continents" },
          ].map((s) => (
            <li
              key={s.v}
              className="rounded-card border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
            >
              <p className="text-2xl font-bold">{s.k}</p>
              <p className="mt-1 text-crescent-100">{s.v}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
