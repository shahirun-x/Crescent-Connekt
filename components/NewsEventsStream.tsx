"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatDateRange } from "@/lib/site";
import { eventCategoryColor } from "@/lib/eventCategories";
import type { CrescentEvent, NewsItem } from "@/lib/types";

type TypeFilter = "All" | "News" | "Events";
const TYPE_FILTERS: TypeFilter[] = ["All", "News", "Events"];

/** A news item or an event, normalised onto one sortable shape. */
type StreamItem =
  | { kind: "news"; sortDate: string; data: NewsItem }
  | { kind: "event"; sortDate: string; data: CrescentEvent };

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsEventsStream({
  news,
  events,
}: {
  news: NewsItem[];
  events: CrescentEvent[];
}) {
  const [type, setType] = useState<TypeFilter>("All");
  const [institution, setInstitution] = useState("All");

  const stream = useMemo<StreamItem[]>(
    () => [
      ...news.map(
        (n): StreamItem => ({ kind: "news", sortDate: n.published_at, data: n })
      ),
      ...events.map(
        (e): StreamItem => ({ kind: "event", sortDate: e.date_start, data: e })
      ),
    ],
    [news, events]
  );

  const institutions = useMemo(
    () => ["All", ...Array.from(new Set(stream.map((i) => i.data.institution_name))).sort()],
    [stream]
  );

  const filtered = useMemo(
    () =>
      stream
        .filter((i) => {
          if (type === "News" && i.kind !== "news") return false;
          if (type === "Events" && i.kind !== "event") return false;
          if (institution !== "All" && i.data.institution_name !== institution)
            return false;
          return true;
        })
        .sort((a, b) => b.sortDate.localeCompare(a.sortDate)),
    [stream, type, institution]
  );

  const counts = useMemo(
    () => ({
      All: stream.length,
      News: stream.filter((i) => i.kind === "news").length,
      Events: stream.filter((i) => i.kind === "event").length,
    }),
    [stream]
  );

  return (
    <div>
      {/* Type tabs */}
      <div
        className="flex flex-wrap gap-2 border-b border-slate-200 pb-4"
        role="group"
        aria-label="Filter by type"
      >
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={type === t}
            onClick={() => setType(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              type === t
                ? "bg-crescent-700 text-white"
                : "border border-slate-200 text-slate-600 hover:border-crescent-300 hover:text-crescent-700"
            }`}
          >
            {t}
            <span
              className={`ml-1.5 text-xs ${
                type === t ? "text-white/70" : "text-slate-500"
              }`}
            >
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Institution filter */}
      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by institution"
      >
        {institutions.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={institution === name}
            onClick={() => setInstitution(name)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              institution === name
                ? "bg-crescent-50 text-crescent-800 ring-1 ring-inset ring-crescent-300"
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
            key={`${item.kind}-${item.data.id}`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.25) }}
          >
            {item.kind === "news" ? (
              <NewsCard item={item.data} />
            ) : (
              <EventCard item={item.data} />
            )}
          </motion.li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-10 rounded-card border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Nothing to show for this filter yet.
        </p>
      )}
    </div>
  );
}

function CardImage({ src }: { src: string }) {
  return (
    <div className="relative aspect-video w-full bg-slate-100">
      <Image
        src={src}
        alt=""
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-slate-200 bg-white">
      {item.image_url && <CardImage src={item.image_url} />}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
            News
          </span>
          <time
            dateTime={item.published_at}
            className="text-xs font-semibold uppercase tracking-wide text-crescent-600"
          >
            {formatDate(item.published_at)}
          </time>
        </div>

        <h2 className="mt-3 text-lg font-semibold leading-snug text-crescent-800">
          {item.title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{item.institution_name}</p>
        <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {item.summary}
        </p>

        {item.content && (
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-semibold text-crescent-600 hover:text-crescent-800">
              Read more
            </summary>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">
              {item.content}
            </p>
          </details>
        )}
      </div>
    </article>
  );
}

function EventCard({ item }: { item: CrescentEvent }) {
  const colors = eventCategoryColor[item.category];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-slate-200 bg-white">
      {item.image_url && <CardImage src={item.image_url} />}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors.soft}`}>
            Event
          </span>
          <span className={`text-xs font-semibold ${colors.text}`}>
            {item.category}
          </span>
          <time
            dateTime={item.date_start}
            className="text-xs font-semibold uppercase tracking-wide text-crescent-600"
          >
            {formatDateRange(item.date_start, item.date_end)}
          </time>
        </div>

        <h2 className="mt-3 text-lg font-semibold leading-snug text-crescent-800">
          {item.title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {item.institution_name}
          {item.location ? ` · ${item.location}` : ""}
        </p>
        <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {item.description}
        </p>
      </div>
    </article>
  );
}
