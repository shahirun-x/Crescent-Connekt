import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // lib/email.ts reads the approval template from disk at runtime. Next's
  // dependency tracer only follows imports, so a path built at runtime is
  // invisible to it — without this the read would work locally and throw
  // ENOENT on Vercel. Keeping the .html as the single source of truth (rather
  // than duplicating it into a TS string) is worth the explicit trace entry.
  outputFileTracingIncludes: {
    "/api/admin/members/[id]/status": [
      "./supabase/email-templates/approval-notification.html",
    ],
  },
  async headers() {
    return [
      {
        // API routes return JSON and so cannot carry a <meta name="robots">.
        // X-Robots-Tag is the header equivalent and is the only way to keep an
        // accidentally-linked endpoint out of an index.
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        // Belt-and-braces for the private surfaces: the meta tag is on each
        // route already, but a header also covers non-HTML responses and
        // redirects, which never render the tag.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        // `:path+` requires at least one segment, so this covers /connect/*
        // without touching /connect itself, which is public and must index.
        source: "/connect/:path+",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost }]
        : []),
      {
        protocol: "https",
        hostname: "zxffaohxxzbthspeelpj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
