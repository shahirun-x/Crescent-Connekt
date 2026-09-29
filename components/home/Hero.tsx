"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { EASE_OUT, useQuietDuration } from "./Figure";

/**
 * Homepage hero.
 *
 * Full-bleed photograph, headline BOTTOM-LEFT over a directional scrim. Not
 * centred: centred type over a picture is the stock hero, and it fights the
 * photograph for the middle of the frame instead of sitting in the quiet
 * corner of it.
 *
 * The photograph is passed in as `media` so this stays a client component only
 * for the motion — the <Shot> inside it is server-rendered, and its brief
 * overlay costs no JavaScript.
 *
 * Every reduced-motion branch here goes through `transition` or a motion
 * value, never through `initial`, `style` or `className`. See the long note on
 * `useQuietDuration` — getting that wrong left this headline invisible.
 */
export default function Hero({ media }: { media: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const dur = useQuietDuration();
  const reduced = useReducedMotion();

  // Gentle parallax: the photograph drifts a little of the section height as
  // the section scrolls past. Small on purpose — a hero that slides faster
  // than the page reads as a gimmick, and a large offset needs overscan that
  // costs resolution. Reduced motion collapses the range to zero; because
  // both ends start at "0%", the server and client agree on first paint.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "8%"]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[85svh] items-end overflow-hidden md:min-h-[94svh]"
    >
      {/* The overscan the parallax drifts within. Constant, so it cannot
          desynchronise between server and client. */}
      <motion.div style={{ y }} className="absolute inset-0 -z-20 scale-[1.08]">
        {media}
      </motion.div>
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      <div className="container-page pb-16 pt-32 md:pb-24">
        <h1 className="type-display max-w-[16ch] text-white">
          {/*
            Line by line, once, on load — not whileInView. The hero is already
            on screen when the page arrives; a scroll trigger would either fire
            immediately (pointless) or never (broken).
          */}
          <Line delay={0.05}>One Crescent.</Line>
          <Line delay={0.17}>Sixteen institutions.</Line>
          <Line delay={0.29}>One network.</Line>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur(0.6), delay: dur(0.46), ease: EASE_OUT }}
          className="type-lead mt-7 max-w-xl text-crescent-100"
        >
          A shared calendar, a member directory, and one place that points
          outward to every institution&apos;s own work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur(0.6), delay: dur(0.56), ease: EASE_OUT }}
          className="mt-10 flex flex-wrap items-center gap-x-9 gap-y-3"
        >
          <Link
            href="/calendar"
            className="inline-flex min-h-[3rem] items-center bg-white px-7 text-[0.95rem] font-semibold text-crescent-900 transition-colors hover:bg-crescent-100"
          >
            See the Central Calendar
          </Link>
          {/* The quiet second action: a text link, not a second button. */}
          <Link
            href="/institutions"
            className="inline-flex min-h-[3rem] items-center border-b border-white/50 text-[0.95rem] text-white transition-colors hover:border-white"
          >
            Browse the institutions
          </Link>
        </motion.div>

        {/*
          One understated line instead of a row of stat boxes. The numbers are
          the same; the difference is that a sentence does not ask to be read
          as an achievement.
        */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur(0.8), delay: dur(0.74), ease: EASE_OUT }}
          className="type-meta mt-14 text-crescent-200"
        >
          Since 1968 · 16 institutions · Chennai, Kilakarai, Madurai, Nagore
        </motion.p>
      </div>
    </section>
  );
}

function Line({ children, delay }: { children: ReactNode; delay: number }) {
  const dur = useQuietDuration();

  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className="block"
        initial={{ y: "108%" }}
        animate={{ y: "0%" }}
        transition={{ duration: dur(0.82), delay: dur(delay), ease: EASE_OUT }}
      >
        {children}
      </motion.span>
    </span>
  );
}
