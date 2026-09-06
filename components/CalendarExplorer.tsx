"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Calendar, { type CalendarView } from "./Calendar";
import { formatDateRange } from "@/lib/site";
import {
  RANGES,
  type RangeKey,
  byDateAsc,
  eventInRange,
  eventOccursOn,
  parseISODate,
  rangeBounds,
  startOfDay,
  toISODate,
} from "@/lib/dates";
import {
  CATEGORY_FILTERS,
  type CategoryFilter,
  catDot,
} from "@/lib/eventCategories";
import type { CrescentEvent } from "@/lib/types";

export default function CalendarExplorer({ events }: { events: CrescentEvent[] }) {
  const now = useMemo(() => new Date(), []);
  const todayISO = useMemo(() => toISODate(new Date()), []);

  const [range, setRange] = useState<RangeKey>("year");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState<Date>(() => startOfDay(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  // A time-range toggle drives BOTH the list window and where the calendar sits.
  function applyRange(key: RangeKey) {
    setRange(key);
    setSelectedDay(null);
    setAnchor(startOfDay(new Date()));
    setView(key === "week" ? "week" : "month");
  }

  function handleSelectDay(iso: string | null) {
    setSelectedDay(iso);
    if (iso) {
      requestAnimationFrame(() =>
        listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }

  // Category filter feeds the calendar dots and the list alike.
  const categoryEvents = useMemo(
    () =>
      category === "All"
        ? events
        : events.filter((e) => e.category === category),
    [events, category]
  );

  // The list is the detail view: a single day when one is selected, otherwise
  // everything inside the active time range.
  const listEvents = useMemo(() => {
    if (selectedDay) {
      return categoryEvents
        .filter((e) => eventOccursOn(e, selectedDay))
        .sort(byDateAsc);
    }
    const [from, to] = rangeBounds(range, now);
    return categoryEvents
      .filter((e) => eventInRange(e, from, to))
      .sort(byDateAsc);
  }, [categoryEvents, selectedDay, range, now]);

  const groups = useMemo(() => {
    const map = new Map<string, CrescentEvent[]>();
    for (const e of listEvents) {
      const key = parseISODate(e.date_start).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return [...map.entries()];
  }, [listEvents]);

  const selectedLabel = selectedDay
    ? parseISODate(selectedDay).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div>
      {/* Unified controls: time range + category filter */}
      <div className="flex flex-col gap-5 rounded-card border border-slate-200 bg-white p-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Time range
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                aria-pressed={range === r.key}
                onClick={() => applyRange(r.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  range === r.key
                    ? "bg-crescent-700 text-white"
                    : "border border-slate-200 text-slate-600 hover:border-crescent-300 hover:text-crescent-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Filter
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by category"
          >
            {CATEGORY_FILTERS.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(c)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-crescent-700 text-white"
                      : "border border-slate-200 text-slate-600 hover:border-crescent-300 hover:text-crescent-700"
                  }`}
                >
                  {c !== "All" && (
                    <span
                      className={`h-2 w-2 rounded-full ${catDot(c)} ${
                        active ? "ring-2 ring-white/40" : ""
                      }`}
                    />
                  )}
                  {c === "All" ? "All Institutions" : c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual overview */}
      <div className="mt-6">
        <Calendar
          events={categoryEvents}
          view={view}
          onViewChange={setView}
          anchor={anchor}
          onAnchorChange={setAnchor}
          selectedDay={selectedDay}
          onSelectDay={handleSelectDay}
          today={todayISO}
        />
      </div>

      {/* Detail view */}
      <div
        ref={listRef}
        className="mt-8 scroll-mt-24 border-t border-slate-200 pt-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500" aria-live="polite">
            {selectedLabel ? (
              <>
                Showing <span className="font-semibold text-slate-700">{listEvents.length}</span>{" "}
                event{listEvents.length === 1 ? "" : "s"} on{" "}
                <span className="font-semibold text-slate-700">{selectedLabel}</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-slate-700">{listEvents.length}</span>{" "}
                event{listEvents.length === 1 ? "" : "s"} in view
              </>
            )}
          </p>
          {selectedDay && (
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-sm font-semibold text-crescent-600 underline-offset-2 hover:text-crescent-800 hover:underline"
            >
              Clear selection
            </button>
          )}
        </div>

        <div className="mt-6 space-y-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${range}-${category}-${selectedDay ?? "all"}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {groups.length === 0 && (
                <p className="rounded-card border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                  {selectedDay
                    ? "No events on this day. Clear the selection to see the full range."
                    : "No events in this range. Try widening the time range or clearing the filter."}
                </p>
              )}

              {groups.map(([month, items]) => (
                <section key={month} className="mb-10">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-crescent-600">
                    {month}
                  </h2>
                  <ul className="space-y-3">
                    {items.map((e) => (
                      <li
                        key={e.id}
                        className="overflow-hidden rounded-card border border-slate-200 bg-white"
                      >
                        {e.image_url && (
                          <div className="relative aspect-video w-full bg-slate-100 sm:aspect-[3/1]">
                            <Image
                              src={e.image_url}
                              alt=""
                              fill
                              sizes="(min-width: 768px) 66vw, 100vw"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="grid gap-3 p-5 sm:grid-cols-[8.5rem_1fr]">
                        <div className="text-sm font-semibold text-crescent-700">
                          <time dateTime={e.date_start}>
                            {formatDateRange(e.date_start, e.date_end)}
                          </time>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-crescent-800">
                              {e.title}
                            </h3>
                            <span className="inline-flex items-center gap-1 rounded-full bg-crescent-50 px-2 py-0.5 text-xs font-semibold text-crescent-700">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${catDot(
                                  e.category
                                )}`}
                              />
                              {e.category}
                            </span>
                            {e.is_featured && (
                              <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-xs font-semibold text-accent-600">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {e.institution_name} · {e.location}
                          </p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-500">
                            {e.description}
                          </p>
                        </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
