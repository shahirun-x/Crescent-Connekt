import CategoryBadge from "./CategoryBadge";
import { institutionCategoryStyle } from "@/lib/site";
import type { Institution } from "@/lib/types";

export default function InstitutionCard({ inst }: { inst: Institution }) {
  const href =
    inst.external_url ||
    `https://www.google.com/search?q=${encodeURIComponent(inst.name)}`;
  const hasSite = Boolean(inst.external_url);
  const style = institutionCategoryStyle[inst.category];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-slate-200 bg-gradient-to-b from-white to-sand-50/70 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-crescent-300 hover:shadow-card-hover">
      {/*
        Category header. A gradient that fades toward transparent on the right
        rather than a flat bar, so the colour reads as a graphic device instead
        of a rule. Widens on hover — a small acknowledgement that costs nothing.
      */}
      <span aria-hidden className="relative block h-2.5 overflow-hidden">
        <span
          className={`absolute inset-0 ${style.bar}`}
          style={{
            maskImage: "linear-gradient(90deg, #000 0%, #000 55%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, #000 0%, #000 55%, transparent 100%)",
          }}
        />
        <span
          className={`absolute inset-y-0 left-0 w-0 ${style.bar} opacity-70 transition-all duration-500 group-hover:w-full`}
        />
      </span>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <CategoryBadge category={inst.category} />
          {inst.established_year && (
            <span className="text-xs font-semibold tabular-nums text-slate-500">
              Est. {inst.established_year}
            </span>
          )}
        </div>
        <h3 className="type-h3 mt-3 leading-snug text-crescent-800">
          {inst.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {inst.location}
        </p>
        {inst.parent_org && (
          <p className="mt-2.5">
            {/*
              Parent-org badge. Given its own identity — a tinted ground, a
              ring, and the trust mark in the category colour — so the two
              governing trusts are legible at a glance across a grid of 16.
              sand-800 on sand-100 is 8.21:1.
            */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-2.5 py-1 text-[0.7rem] font-semibold text-sand-800 ring-1 ring-inset ring-sand-300">
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3 shrink-0"
                fill={style.hex}
                aria-hidden
              >
                <path d="M12 3 2 8v2h20V8L12 3ZM4 12v7H2v2h20v-2h-2v-7h-2v7h-3v-7h-2v7h-2v-7H9v7H6v-7H4Z" />
              </svg>
              {inst.parent_org}
            </span>
          </p>
        )}
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
          {inst.description}
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-crescent-600 transition-colors hover:text-crescent-800"
        >
          {hasSite ? "Visit official website" : "Search online"}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </article>
  );
}
