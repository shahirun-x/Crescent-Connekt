"use client";

import { motion } from "framer-motion";
import { useMobileSpeed } from "./about/motion";

/**
 * The CGOM School-to-Start-up continuum.
 *
 * This is the conceptual core of the mission, so it is built as a full-bleed
 * dark section rather than seven small circles inside a thin box. Nodes are
 * large, the connector is a real drawn path with visible weight, and each
 * stage carries a line of description rather than a single word.
 *
 * Desktop: a horizontal journey with the path drawing itself left to right.
 * Mobile: the same journey rotated vertical, with equal weight — the rail
 * runs down the left and each stage sits beside it. Not a shrunken desktop.
 */

const STEPS: { label: string; line: string }[] = [
  { label: "Learning", line: "Foundations built in the classroom, across every Crescent school." },
  { label: "Ideas", line: "Curiosity given room — projects, clubs and first questions." },
  { label: "Innovation", line: "Ideas tested and prototyped inside the university." },
  { label: "Incubation", line: "CIIC turns a working prototype into a venture." },
  { label: "Acceleration", line: "Mentoring, funding routes and alumni networks applied." },
  { label: "Commercialization", line: "A venture that stands on its own in the market." },
  { label: "Global Impact", line: "Crescent graduates and ventures contributing worldwide." },
];

export default function Pipeline({ className = "" }: { className?: string }) {
  const speed = useMobileSpeed();

  return (
    <div className={className}>
      {/* ------------------------------------------------ desktop: horizontal */}
      <ol className="relative hidden lg:grid lg:grid-cols-7 lg:gap-4">
        {/* The rail. Drawn once behind the nodes, animating its own width. */}
        <motion.span
          aria-hidden="true"
          className="absolute left-0 top-7 h-[3px] origin-left rounded-full bg-gradient-to-r from-gold-300 via-teal-300 to-crescent-300"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%" }}
        />

        {STEPS.map((s, i) => (
          <motion.li
            key={s.label}
            className="relative flex flex-col items-start"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.5,
              delay: (0.15 + i * 0.11) * speed,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-crescent-950 text-base font-extrabold text-gold-300 ring-2 ring-gold-300/60">
              {i + 1}
            </span>
            <span className="mt-4 block text-sm font-bold tracking-tight text-white">
              {s.label}
            </span>
            {/* crescent-100 on crescent-950 is 14.6:1 */}
            <span className="mt-1.5 block text-xs leading-relaxed text-crescent-100">
              {s.line}
            </span>
          </motion.li>
        ))}
      </ol>

      {/* -------------------------------------------------- mobile: vertical */}
      <ol className="relative lg:hidden">
        <motion.span
          aria-hidden="true"
          className="absolute bottom-6 left-7 top-6 w-[3px] origin-top rounded-full bg-gradient-to-b from-gold-300 via-teal-300 to-crescent-300"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />

        {STEPS.map((s, i) => (
          <motion.li
            key={s.label}
            className="relative flex gap-5 pb-8 last:pb-0"
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.45,
              delay: (0.1 + i * 0.09) * speed,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-crescent-950 text-base font-extrabold text-gold-300 ring-2 ring-gold-300/60">
              {i + 1}
            </span>
            <span className="pt-2">
              <span className="block text-base font-bold tracking-tight text-white">
                {s.label}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-crescent-100">
                {s.line}
              </span>
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
