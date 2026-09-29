"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { nav } from "@/lib/site";

/**
 * Site header.
 *
 * On the homepage it starts transparent over the hero photograph and turns to
 * paper once the hero is behind it, so the picture runs to the top of the
 * screen instead of beginning under a white bar. Everywhere else it is paper
 * from the first pixel.
 *
 * Solid rather than frosted: a translucent blurred header is the same
 * glassmorphism idiom the redesign removed everywhere else, and it makes
 * whatever scrolls beneath it read as smudged.
 *
 * The "Central Calendar" pill is gone. The hero already carries that action as
 * its primary button, and a header CTA competing with a hero CTA is the shape
 * of a landing page, not of an institutional site.
 */
export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const onHome = pathname === "/";
  const transparent = onHome && !scrolled && !open;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!onHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/*
        The header is fixed so it can sit over the homepage hero. Every other
        route needs its height back, or the first heading hides under it.
      */}
      {!onHome && <div aria-hidden="true" className="h-[4.5rem]" />}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-transparent"
          : "border-b border-ink-200 bg-paper/98 shadow-[0_1px_2px_rgba(15,33,64,0.04)]"
      }`}
    >
      <nav
        className="container-page flex h-[4.5rem] items-center justify-between"
        aria-label="Primary"
      >
        <Link
          href="/"
          aria-label="Crescent Connekt home"
          className="inline-flex min-h-[2.75rem] items-center"
        >
          <Logo mono={transparent} />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                /*
                  Active state is a hairline under the word, not a pill of
                  background colour. A row of tinted pills reads as an app's
                  tab bar; a rule reads as a table of contents.
                */
                className={`inline-flex min-h-[2.75rem] items-center border-b-2 pb-1 text-[0.9rem] transition-colors ${
                  transparent
                    ? isActive(item.href)
                      ? "border-white text-white"
                      : "border-transparent text-white/80 hover:text-white"
                    : isActive(item.href)
                      ? "border-accent-500 text-ink-900"
                      : "border-transparent text-ink-700 hover:text-ink-900"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={`-mr-2 inline-flex h-11 w-11 items-center justify-center lg:hidden ${
            transparent ? "text-white" : "text-ink-900"
          }`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 7h18M3 16h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

        {open && <MobileMenu onClose={() => setOpen(false)} isActive={isActive} />}
      </header>
    </>
  );
}

/**
 * Full-screen mobile navigation.
 *
 * Large serif links with room to breathe, not a cramped dropdown list. Focus
 * is trapped inside it while it is open and returned to the toggle on close,
 * and Escape closes it — a panel covering the whole viewport that leaves focus
 * behind it in the page is worse than no panel.
 */
function MobileMenu({
  onClose,
  isActive,
}: {
  onClose: () => void;
  isActive: (href: string) => boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const panel = ref.current;
    panel?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      id="mobile-menu"
      className="fixed inset-x-0 bottom-0 top-[4.5rem] z-50 overflow-y-auto bg-paper lg:hidden"
    >
      <ul className="container-page flex flex-col py-8">
        {nav.map((item) => (
          <li key={item.href} className="border-b border-ink-100">
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              // min-h keeps every row past the 44px target with room to spare.
              className={`flex min-h-[3.75rem] items-center font-[family-name:var(--font-display)] text-[1.75rem] ${
                isActive(item.href) ? "text-accent-700" : "text-ink-900"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
