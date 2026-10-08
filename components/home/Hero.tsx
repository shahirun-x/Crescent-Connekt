"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Shot from "@/components/Shot";
import type { SiteImage } from "@/lib/images";
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
interface HeroProps {
  media?: ReactNode;
  slides?: SiteImage[];
}

export default function Hero({ media, slides }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const dur = useQuietDuration();
  const reduced = useReducedMotion();

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasSlides = Boolean(slides && slides.length > 0);
  const slideCount = slides?.length ?? 0;

  useEffect(() => {
    if (!hasSlides || slideCount <= 1) return;
    if (reduced || isPaused || isHovered) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slideCount);
    }, 6000);

    return () => clearInterval(timer);
  }, [hasSlides, slideCount, reduced, isPaused, isHovered]);

  const goToSlide = (idx: number) => {
    setCurrent(idx);
  };

  const nextSlide = () => {
    if (slideCount <= 1) return;
    setCurrent((prev) => (prev + 1) % slideCount);
  };

  const prevSlide = () => {
    if (slideCount <= 1) return;
    setCurrent((prev) => (prev - 1 + slideCount) % slideCount);
  };

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative isolate flex min-h-[85svh] items-end overflow-hidden md:min-h-[94svh]"
    >
      {/* The overscan the parallax drifts within. Constant, so it cannot
          desynchronise between server and client. */}
      <motion.div style={{ y }} className="absolute inset-0 -z-20 scale-[1.08]">
        {hasSlides && slides ? (
          slides.map((slide, idx) => (
            <div
              key={slide.src || idx}
              aria-hidden={current !== idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                current === idx
                  ? "opacity-100 z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <Shot
                image={slide}
                className="h-full w-full"
                sizes="100vw"
                priority={idx === 0}
              />
            </div>
          ))
        ) : (
          media
        )}
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

        {/* Bottom row: meta note on the left, slide controls on the right */}
        <div className="mt-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: dur(0.8), delay: dur(0.74), ease: EASE_OUT }}
            className="type-meta text-crescent-200"
          >
            Since 1968 · 16 institutions · Chennai, Kilakarai, Madurai, Nagore
          </motion.p>

          {hasSlides && slideCount > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur(0.6), delay: dur(0.74), ease: EASE_OUT }}
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-crescent-950/70 p-1.5 backdrop-blur-md self-start sm:self-auto"
              role="region"
              aria-label="Photography slides"
            >
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous photograph"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex items-center gap-1 px-1" role="tablist" aria-label="Hero slides">
                {slides!.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={current === i}
                    aria-label={`Slide ${i + 1} of ${slideCount}`}
                    onClick={() => goToSlide(i)}
                    className={`flex h-8 min-w-[2rem] items-center justify-center rounded-full px-2 font-mono text-[0.78rem] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      current === i
                        ? "bg-white font-bold text-crescent-950 shadow-sm"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    0{i + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next photograph"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                aria-label={isPaused ? "Play slide rotation" : "Pause slide rotation"}
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border-l border-white/20 pl-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {isPaused ? (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                )}
              </button>

              <span className="sr-only" aria-live="polite">
                Slide {current + 1} of {slideCount}
              </span>
            </motion.div>
          )}
        </div>
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
