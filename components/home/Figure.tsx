"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useMobileSpeed } from "../about/motion";

/** The one easing curve the redesign uses. Slow out, no bounce. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * How long an animation should take for this viewer: the given duration, or 0
 * if they have asked for reduced motion.
 *
 * ---------------------------------------------------------------------------
 * READ THIS BEFORE USING IT ANYWHERE ELSE
 * ---------------------------------------------------------------------------
 *
 * The reduced-motion preference must ONLY reach `transition`. It must never
 * reach `initial`, `animate`, `style` or `className`.
 *
 * `useReducedMotion()` returns null on the server and the real preference on
 * the client. Framer writes `initial` straight into the inline style of the
 * server-rendered HTML, so branching on the hook there produces two different
 * DOM trees. React does not patch mismatched attributes — it logs and moves
 * on — which leaves the SERVER's style stuck on the node forever.
 *
 * That is not theoretical. The first version of the hero did exactly this:
 * the headline shipped with `transform: translateY(108%)` inside an
 * `overflow: hidden` box, the client thought it had rendered `opacity: 0`
 * instead, and the two never reconciled. For every viewer with reduce-motion
 * enabled, the largest text on the site was invisible.
 *
 * `transition` is never serialised into HTML, so routing the preference
 * through it alone is safe. Duration 0 means the element snaps to its end
 * state on the first frame: no movement, and nothing stranded.
 *
 * This is the same contract as MotionProvider's `reducedMotion="never"`
 * (DECISIONS #9) — content always ends up visible, motion is what goes away.
 */
export function useQuietDuration() {
  const reduced = useReducedMotion();
  return (seconds: number) => (reduced ? 0 : seconds);
}

/**
 * A photograph arriving: a clip-path wipe from an 8% inset to the full frame,
 * while the picture settles from 1.05 to 1. Once, never again on re-entry.
 *
 * No opacity: the photograph is there from first paint (and without
 * JavaScript), just slightly inset — the wipe opens it rather than conjuring
 * it. Nothing slides sideways and nothing bounces.
 *
 * Containment: `overflow-hidden` on the clipping box, which never scales. The
 * 1.05 scale lives on the inner layer, so it can never widen the document —
 * on phones, transforms that escape their box are the classic cause of
 * sideways scroll.
 *
 * Hydration-safe: `initial` is constant; reduced motion only reaches
 * `transition` (duration 0), per useQuietDuration above.
 */
export default function Figure({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const speed = useMobileSpeed();
  const dur = useQuietDuration();
  const transition = { delay: dur(delay * speed), ease: EASE_OUT };

  return (
    <motion.div
      className={`overflow-hidden ${className ?? ""}`}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: { clipPath: "inset(8% 8% 8% 8%)" },
        shown: {
          clipPath: "inset(0% 0% 0% 0%)",
          transition: { ...transition, duration: dur(0.85) },
        },
      }}
    >
      <motion.div
        variants={{
          hidden: { scale: 1.05 },
          shown: { scale: 1, transition: { ...transition, duration: dur(0.9) } },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Text arriving beside a photograph.
 *
 * A shorter, smaller move than the image — type that travels as far as a
 * picture looks like it is being flung onto the page.
 */
export function Rise({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "p";
}) {
  const speed = useMobileSpeed();
  const dur = useQuietDuration();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: dur(0.48),
        delay: dur(delay * speed),
        ease: EASE_OUT,
      }}
    >
      {children}
    </Tag>
  );
}
