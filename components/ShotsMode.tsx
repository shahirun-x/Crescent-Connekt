"use client";

import { useEffect } from "react";

/**
 * Turns on the photographer's brief overlay when the URL carries `?shots=1`.
 *
 * Reading `window.location` in an effect rather than `searchParams` on the
 * page is deliberate: touching `searchParams` in a server component opts the
 * route out of static rendering, and the homepage is ISR. A briefing tool must
 * not cost every visitor their cached HTML.
 *
 * It sets one attribute; `globals.css` does the rest, so the overlays are
 * plain server-rendered markup that is simply hidden until asked for.
 */
export default function ShotsMode() {
  useEffect(() => {
    const on = new URLSearchParams(window.location.search).get("shots") === "1";
    const root = document.documentElement;
    if (on) root.setAttribute("data-shots", "1");
    return () => root.removeAttribute("data-shots");
  }, []);

  return null;
}
