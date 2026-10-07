import type { Metadata, Viewport } from "next";
import { Newsreader, Figtree } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ShotsMode from "@/components/ShotsMode";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { site, SITE_URL } from "@/lib/site";

/**
 * Typefaces.
 *
 * `next/font` downloads and self-hosts these at BUILD time — no runtime
 * request to Google, no third-party connection, and `display: "swap"` with a
 * matched fallback means no layout shift. It is part of Next, so this adds no
 * dependency.
 *
 * Newsreader (display) is a text-first serif drawn for screen reading: real
 * contrast and a sharp axis at 60px, still comfortable at 20px in a pull
 * quote. It carries institutional weight without the stiffness of a
 * transitional serif like Playfair, which collapses at body sizes.
 *
 * Figtree (text/UI) is a geometric humanist sans with open apertures and a
 * tall x-height — legible at 13px metadata, neutral enough at 18px not to
 * compete with the serif. Deliberately not Inter: Inter is the default of
 * every generated site, and the brief was to stop reading as one.
 *
 * Both expose a variable weight axis, so one file per family covers the whole
 * scale.
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Crescent Connekt",
    "Crescent ecosystem",
    "B.S. Abdur Rahman Crescent Institute",
    "Crescent schools",
    "Crescent alumni",
    "Central Calendar",
    "Member Network",
  ],
  authors: [{ name: "Crescent Connekt" }],
  // og:title and og:description are deliberately NOT set here. When a parent
  // defines them, every child inherits the same value and each page shares as
  // the homepage. Left unset, Next fills them from each page's own title and
  // description, so /calendar shares as "Central Calendar" rather than the
  // site tagline.
  openGraph: {
    type: "website",
    siteName: site.name,
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#1a3a6b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${newsreader.variable} ${figtree.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper text-ink-700">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-crescent-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {/* Site-wide identity. Referenced by @id from the per-page blocks. */}
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <MotionProvider>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </MotionProvider>
        {/* ?shots=1 — reveals the photographer's brief on every image slot. */}
        <ShotsMode />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
