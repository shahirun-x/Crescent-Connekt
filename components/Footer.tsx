import Link from "next/link";
import Logo from "./Logo";
import { nav, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-crescent-950 text-slate-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo className="[&_span]:text-white [&_span:last-child]:text-crescent-300" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {site.description}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            A Crescent Global Outreach Mission (CGOM) initiative. This portal
            supplements — it does not replace — the official website of each
            institution.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Contact
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>
              <a
                href={`mailto:${site.contactEmail}`}
                className="transition-colors hover:text-white"
              >
                {site.contactEmail}
              </a>
            </li>
            <li>Crescent Campus, Vandalur, Chennai 600048, India</li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-white">
                Send us a message →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Crescent Global. All rights reserved.</p>
          <p>One Crescent. One Community. One Global Network.</p>
        </div>
      </div>
    </footer>
  );
}
