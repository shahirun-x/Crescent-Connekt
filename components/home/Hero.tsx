"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** 7s on screen, then a 1.5s crossfade into the next. */
const HOLD_MS = 7000;

export interface HeroSlide {
  desktop: StaticImageData;
  /** object-position — phones crop these landscapes to portrait. */
  focal: string;
  alt: string;
  /** Server-rendered `?shots=1` brief for this slide. */
  brief?: ReactNode;
}

/**
 * Homepage hero — a slow crossfade through the client's five photographs.
 *
 * Restraint is the point: one photograph at a time, ~7s each, a 1.5s
 * crossfade, a 1.00 → 1.06 zoom you feel more than see, and five thin lines
 * for progress. No arrows, no dots, no frosted control pill. The headline sits
 * bottom-left on a scrim tied to the text block itself.
 *
 * LOADING. Only the first photograph is rendered at first, with `priority` —
 * it is the LCP element. The other four mount after it has loaded, so they
 * never compete with it for bandwidth.
 *
 * MOTION. Pauses when the tab is hidden (no point burning frames, and the
 * reader should not come back mid-fade) and when the reader presses Pause —
 * WCAG 2.2.2 requires a way to stop content that changes on its own. Under
 * prefers-reduced-motion the other slides never mount, nothing advances, and
 * the CSS drops the zoom: the first photograph, still.
 *
 * HYDRATION. Server and first client render are identical (slide 0 only, no
 * reduced-motion branch). Everything that differs is decided in effects. See
 * useQuietDuration in Figure.tsx for why that matters.
 */
export default function Hero({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  // Increments on every advance. Keys the progress fill so it restarts once
  // per slide — and ONLY then (keying on `prev` restarted it mid-slide when
  // the outgoing photo was dropped).
  const [pass, setPass] = useState(0);
  const indexRef = useRef(0);
  const [ready, setReady] = useState(false); // first image loaded → mount the rest
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  const firstImg = useRef<HTMLImageElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef(0);
  const remaining = useRef(HOLD_MS);

  // Reduced motion and tab visibility — read in effects, never during render.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduced(mq.matches);
    const syncVisible = () => setHidden(document.hidden);
    syncMotion();
    syncVisible();
    mq.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisible);
    return () => {
      mq.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisible);
    };
  }, []);

  // The first image may already be decoded by the time we hydrate.
  useEffect(() => {
    if (firstImg.current?.complete) setReady(true);
  }, []);

  const animating = count > 1 && ready && !reduced;
  const paused = !animating || hidden || userPaused;

  // State setters only — no setter called inside another's updater, which
  // React may run twice.
  const advance = useCallback(() => {
    const current = indexRef.current;
    const next = (current + 1) % count;
    indexRef.current = next;
    remaining.current = HOLD_MS;
    setPrev(current);
    setIndex(next);
    setPass((n) => n + 1);
  }, [count]);

  // One timer, resumable: pausing banks the time left on the current slide so
  // the JS clock and the CSS progress line (paused via animation-play-state)
  // stay in step.
  useEffect(() => {
    if (paused) return;
    let fired = false;
    startedAt.current = Date.now();
    timer.current = setTimeout(() => {
      fired = true;
      advance();
    }, remaining.current);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      // Bank the unused time ONLY when interrupted (pause, hidden tab). After
      // the timer has fired, `advance` has already reset the clock for the new
      // slide — banking here would subtract a full 7s from it and fire again
      // immediately, skipping a photograph.
      if (!fired) {
        remaining.current = Math.max(
          0,
          remaining.current - (Date.now() - startedAt.current)
        );
      }
    };
  }, [paused, index, advance]);

  // Drop the outgoing slide once its fade has finished.
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 1600);
    return () => clearTimeout(t);
  }, [prev]);

  const mounted = (i: number) => i === 0 || (ready && !reduced);

  return (
    <section
      aria-label="Introduction"
      className={`relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-crescent-950 ${
        paused ? "hero-paused" : ""
      }`}
    >
      {/* Photographs. Stacked; opacity crossfades between them. */}
      <div className="absolute inset-0 -z-20">
        {slides.map((s, i) =>
          mounted(i) ? (
            <div
              key={i}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* The zoom wrapper restarts its animation each time a slide
                  comes round again, because the class is only present while
                  the slide is current or fading out. */}
              <div
                className={`absolute inset-0 ${
                  i === index || i === prev ? "hero-zoom" : ""
                }`}
              >
                <Image
                  ref={i === 0 ? firstImg : undefined}
                  src={s.desktop}
                  alt={s.alt}
                  fill
                  sizes="100vw"
                  quality={80}
                  priority={i === 0}
                  placeholder="blur"
                  onLoad={i === 0 ? () => setReady(true) : undefined}
                  className="object-cover"
                  style={{ objectPosition: s.focal }}
                />
              </div>
              {s.brief}
            </div>
          ) : null
        )}
      </div>

      {/* Behind the transparent header only. */}
      <div aria-hidden="true" className="scrim-nav pointer-events-none absolute inset-x-0 top-0 -z-10 h-36" />

      {/* Text, on its own scrim so the darkening follows it at every width. */}
      <div className="scrim-hero-headline pt-32">
        <div className="container-page">
          {/*
            Explicit lines, no ch-based max-width. A `ch` is a different width
            in the fallback font than in Newsreader, so a ch cap re-wrapped the
            headline when the real font arrived and, because the block is
            anchored to the bottom, shifted everything above it (CLS 0.05).
            On phones "Sixteen / institutions." is two lines on purpose: every
            line then fits with room to spare in either font.
          */}
          <h1 className="type-display text-white">
            <Line delay={0.05}>One Crescent.</Line>
            <Line delay={0.17}>
              <span className="block md:inline">Sixteen</span>{" "}
              <span className="block md:inline">institutions.</span>
            </Line>
            <Line delay={0.29}>One network.</Line>
          </h1>
        </div>

        <div className="scrim-hero-lift mt-6 pb-10 pt-4 md:pb-14">
          <div className="container-page">
            <p className="hero-rise type-lead max-w-xl text-white" style={{ animationDelay: "0.46s" }}>
              A shared calendar, a member directory, and one place that points
              outward to every institution&apos;s own work.
            </p>

            <div
              className="hero-rise mt-8 flex flex-wrap items-center gap-x-8 gap-y-3"
              style={{ animationDelay: "0.56s" }}
            >
              <Link
                href="/calendar"
                className="inline-flex min-h-[3rem] items-center bg-white px-7 text-[0.95rem] font-semibold text-crescent-900 transition-colors hover:bg-crescent-100"
              >
                See the Central Calendar
              </Link>
              <Link
                href="/institutions"
                className="inline-flex min-h-[3rem] items-center border-b border-white/60 text-[0.95rem] text-white transition-colors hover:border-white"
              >
                Browse the institutions
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
              <p className="type-meta text-crescent-100">
                Since 1968 · 16 institutions · Chennai, Kilakarai, Madurai, Nagore
              </p>

              {count > 1 && (
                // Hidden under reduced motion: nothing moves, so there is
                // nothing to show progress of or to pause.
                <div className="flex items-center gap-4 motion-reduce:hidden">
                  <ol aria-hidden="true" className="flex gap-1.5">
                    {slides.map((_, i) => (
                      <li key={i} className="h-px w-8 overflow-hidden bg-white/35 sm:w-10">
                        <span
                          // Remount on each pass so the fill restarts.
                          key={i === index ? `on-${pass}` : "off"}
                          className={`block h-full bg-white ${
                            i === index
                              ? "hero-progress-fill"
                              : i < index
                                ? "scale-x-100"
                                : "scale-x-0"
                          }`}
                          style={i === index ? undefined : { transformOrigin: "left" }}
                        />
                      </li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    onClick={() => setUserPaused((p) => !p)}
                    aria-pressed={userPaused}
                    className="inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center text-[0.8rem] tracking-wide text-white underline-offset-4 hover:underline"
                  >
                    {userPaused ? "Play" : "Pause"}
                    <span className="sr-only"> the photographs</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** One headline line, sliding up out of its own clip box — in CSS (see globals.css). */
function Line({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <span className="hero-line block" style={{ animationDelay: `${delay}s` }}>
        {children}
      </span>
    </span>
  );
}
