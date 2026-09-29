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
 * A photograph arriving.
 *
 * Fade plus a 1.04 → 1 settle, which reads as the image coming to rest rather
 * than sliding in from somewhere. 620ms: long enough to be felt, short enough
 * that scrolling never waits for it. Once only — a picture that re-animates
 * every time it passes the viewport is a distraction, not a flourish.
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

  return (
    /*
     * The clipping wrapper is load-bearing, not decoration.
     *
     * The inner box starts at scale 1.04. On a full-bleed image that is 4% of
     * the viewport wider than the viewport, and until it scrolls into view and
     * settles, the whole document scrolls sideways — 1425px of content in a
     * 1454px scroll width, on every phone and desktop alike. Clipping the
     * overflow at a box that never scales contains it.
     */
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          duration: dur(0.62),
          delay: dur(delay * speed),
          ease: EASE_OUT,
        }}
      >
        {children}
      </motion.div>
    </div>
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
