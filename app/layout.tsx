import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { site, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Crescent Global",
    "Crescent ecosystem",
    "B.S. Abdur Rahman Crescent Institute",
    "Crescent schools",
    "Crescent alumni",
    "Central Calendar",
    "CGOM",
  ],
  authors: [{ name: "Crescent Global Outreach Mission" }],
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
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-slate-800">
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
        <Analytics />
      </body>
    </html>
  );
}
