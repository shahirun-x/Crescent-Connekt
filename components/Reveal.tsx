"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMobileSpeed } from "./about/motion";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "ul";
}

/**
 * Subtle scroll-into-view fade + rise.
 *
 * Reduced motion is handled site-wide: MotionProvider sets
 * reducedMotion="never" (DECISIONS #9, because framer's own handling left
 * whileInView content stuck at opacity 0), and the global CSS rule collapses
 * transition and animation durations. Content is therefore always visible;
 * only the movement goes away.
 *
 * Delays are multiplied by the mobile speed factor so a stagger that reads as
 * elegant on desktop does not feel sluggish on a phone.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = "div",
}: RevealProps) {
  const speed = useMobileSpeed();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: delay * speed,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Stagger container for grids.
 *
 * Animating each child with its own delay prop means every card recalculates
 * on re-render. A parent variant with staggerChildren lets Framer schedule the
 * sequence once, which is both smoother and cheaper on a long list.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "section";
  stagger?: number;
}) {
  const speed = useMobileSpeed();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger * speed },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}

/** A child of RevealGroup. Takes its timing from the parent. */
export function RevealItem({
  children,
  className,
  as = "div",
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  y?: number;
}) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
