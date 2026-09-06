"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { NewsItem } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsList({ items }: { items: NewsItem[] }) {
  const institutions = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.institution_name)))],
    [items]
  );
  const [active, setActive] = useState("All");

  const filtered =
    active === "All"
      ? items
      : items.filter((i) => i.institution_name === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by institution">
        {institutions.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={active === name}
            onClick={() => setActive(name)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active === name
                ? "bg-crescent-700 text-white"
                : "border border-slate-200 text-slate-600 hover:border-crescent-300 hover:text-crescent-700"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {filtered.map((item, idx) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.25) }}
          >
            <article className="flex h-full flex-col overflow-hidden rounded-card border border-slate-200 bg-white">
              {item.image_url && (
                <div className="relative aspect-video w-full bg-slate-100">
                  <Image
                    src={item.image_url}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-crescent-600">
                <time dateTime={item.published_at}>
                  {formatDate(item.published_at)}
                </time>
                <span aria-hidden>·</span>
                <span className="rounded-full bg-crescent-50 px-2 py-0.5 normal-case text-crescent-700">
                  {item.institution_name}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-crescent-800">
                {item.title}
              </h2>
              <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {item.summary}
              </p>
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer font-semibold text-crescent-600 hover:text-crescent-800">
                  Read more
                </summary>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">
                  {item.content}
                </p>
              </details>
              </div>
            </article>
          </motion.li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-10 rounded-card border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No news from this institution yet.
        </p>
      )}
    </div>
  );
}
