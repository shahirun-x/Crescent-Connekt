"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addDays,
  addMonths,
  mondayOf,
  parseISODate,
  startOfDay,
  toISODate,
} from "@/lib/dates";
import { catDot, catGlow, eventCategoryColor } from "@/lib/eventCategories";
import type { CrescentEvent } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type CalendarView = "month" | "week";

interface CalendarProps {
  /** Events already filtered by the active category. */
  events: CrescentEvent[];
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  /** The month (month view) or any day in the week (week view) on display. */
  anchor: Date;
  onAnchorChange: (d: Date) => void;
  selectedDay: string | null;
  onSelectDay: (iso: string | null) => void;
  /** ISO date of "today", passed in so it stays stable across renders. */
  today: string;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return mobile;
}

/**
 * Roving tabindex for the month grid.
 *
 * The grid is one tab stop, not 42. Arrow keys move focus between days,
 * Home/End jump to the ends of a row, PageUp/PageDown change month. This is
 * the APG grid pattern — without it a keyboard user would either tab through
 * every cell or, since empty days are not activatable, be unable to reach
 * most of the month at all.
 */
function useRovingGrid(
  days: Date[],
  anchor: Date,
  onAnchorChange: (d: Date) => void
) {
  const [focusedIso, setFocusedIso] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null>(null);

  const register = useCallback((iso: string, el: HTMLButtonElement | null) => {
    if (el) refs.current.set(iso, el);
    else refs.current.delete(iso);
  }, []);

  // After the month changes, focus the day we navigated to once it exists.
  useEffect(() => {
    const want = pendingFocus.current;
    if (!want) return;
    const el = refs.current.get(want);
    if (el) {
      el.focus();
      setFocusedIso(want);
      pendingFocus.current = null;
    }
  }, [days]);

  const moveTo = useCallback(
    (target: Date) => {
      const iso = toISODate(target);
      const el = refs.current.get(iso);
      if (el) {
        el.focus();
        setFocusedIso(iso);
      } else {
        // Off the rendered grid — change month, then focus after it renders.
        pendingFocus.current = iso;
        onAnchorChange(target);
      }
    },
    [onAnchorChange]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, current: Date) => {
      const deltas: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
      };

      if (e.key in deltas) {
        e.preventDefault();
        moveTo(addDays(current, deltas[e.key]));
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        moveTo(mondayOf(current));
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        moveTo(addDays(mondayOf(current), 6));
        return;
      }
      if (e.key === "PageUp") {
        e.preventDefault();
        moveTo(addMonths(current, -1));
        return;
      }
      if (e.key === "PageDown") {
        e.preventDefault();
        moveTo(addMonths(current, 1));
      }
    },
    [moveTo]
  );

  // The single tab stop: whatever is focused, else today if it's on screen,
  // else the first day of the grid.
  const tabStopIso = useMemo(() => {
    if (focusedIso && refs.current.has(focusedIso)) return focusedIso;
    const todayIso = toISODate(startOfDay(new Date()));
    if (days.some((d) => toISODate(d) === todayIso)) return todayIso;
    const firstOfMonth = days.find((d) => d.getMonth() === anchor.getMonth());
    return toISODate(firstOfMonth ?? days[0]);
  }, [focusedIso, days, anchor]);

  return { register, onKeyDown, tabStopIso, setFocusedIso };
}

/** Tooltip + caret placement so it never clips the calendar edges. */
function tipPlacement(row: number, col: number) {
  const below = row < 2; // top two rows → drop the tooltip below the cell
  const vert = below ? "top-full mt-2" : "bottom-full mb-2";
  let horiz = "left-1/2 -translate-x-1/2";
  let caretX = "left-1/2 -translate-x-1/2";
  if (col <= 1) {
    horiz = "left-0";
    caretX = "left-5";
  } else if (col >= 5) {
    horiz = "right-0";
    caretX = "right-5";
  }
  const caretY = below ? "-top-1 border-l border-t" : "-bottom-1 border-r border-b";
  return { wrap: `${vert} ${horiz}`, caret: `${caretX} ${caretY}` };
}

export default function Calendar({
  events,
  view,
  onViewChange,
  anchor,
  onAnchorChange,
  selectedDay,
  onSelectDay,
  today,
}: CalendarProps) {
  const isMobile = useIsMobile();
  const [dir, setDir] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

  // Map every day (as ISO) to the events that touch it, expanding multi-day spans.
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CrescentEvent[]>();
    for (const e of events) {
      let d = parseISODate(e.date_start);
      const end = parseISODate(e.date_end ?? e.date_start);
      let guard = 0;
      while (d <= end && guard < 90) {
        const key = toISODate(d);
        map.set(key, [...(map.get(key) ?? []), e]);
        d = addDays(d, 1);
        guard += 1;
      }
    }
    return map;
  }, [events]);

  const weekStart = useMemo(() => mondayOf(anchor), [anchor]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const monthDays = useMemo(() => {
    const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const gridStart = mondayOf(monthStart);
    const gridEndExclusive = addDays(mondayOf(monthEnd), 7);
    const count = Math.round(
      (gridEndExclusive.getTime() - gridStart.getTime()) / 86_400_000
    );
    return Array.from({ length: count }, (_, i) => addDays(gridStart, i));
  }, [anchor]);

  const todayWeekKey = useMemo(
    () => toISODate(mondayOf(parseISODate(today))),
    [today]
  );

  const grid = useRovingGrid(monthDays, anchor, onAnchorChange);

  function step(delta: number) {
    setDir(delta);
    onAnchorChange(
      view === "month" ? addMonths(anchor, delta) : addDays(anchor, delta * 7)
    );
  }

  function goToday() {
    setDir(0);
    onAnchorChange(startOfDay(new Date()));
  }

  const title =
    view === "month"
      ? anchor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
      : `${weekStart.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })} – ${weekDays[6].toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`;

  const bodyKey =
    view === "month"
      ? `m-${anchor.getFullYear()}-${anchor.getMonth()}`
      : `w-${toISODate(weekStart)}`;

  const navBtn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition duration-200 hover:border-crescent-300 hover:bg-white hover:text-crescent-700 md:h-7 md:w-7";

  return (
    <section
      aria-label="Events calendar"
      className="rounded-card border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3 sm:p-4"
    >
      {/* Header: title + view toggle + navigation */}
      <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-bold tracking-tight text-crescent-800 sm:text-lg">
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* iOS-style segmented control with a sliding thumb */}
          <div
            className="relative inline-flex rounded-full bg-slate-100 p-0.5"
            role="group"
            aria-label="Calendar view"
          >
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => onViewChange(v)}
                className={`relative rounded-full px-3 py-1 text-[0.7rem] font-semibold capitalize transition-colors duration-200 ${
                  view === v ? "text-crescent-700" : "text-slate-600 hover:text-slate-700"
                }`}
              >
                {view === v && (
                  <motion.span
                    layoutId="calViewThumb"
                    className="absolute inset-0 rounded-full bg-white shadow-sm"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{v}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={view === "month" ? "Previous month" : "Previous week"}
              onClick={() => step(-1)}
              className={navBtn}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goToday}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-[0.7rem] font-semibold text-slate-600 transition duration-200 hover:border-crescent-300 hover:bg-white hover:text-crescent-700 md:py-1"
            >
              Today
            </button>
            <button
              type="button"
              aria-label={view === "month" ? "Next month" : "Next week"}
              onClick={() => step(1)}
              className={navBtn}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* overflow-visible so day tooltips are never clipped by the container */}
      <div className="overflow-visible rounded-xl border border-slate-200 bg-white">
        {/* Weekday header (month + desktop week grid) */}
        {(view === "month" || !isMobile) && (
          <div className="grid grid-cols-7 rounded-t-xl border-b border-slate-200 bg-slate-50/80">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`px-1 py-1.5 text-center text-[0.6rem] font-semibold uppercase tracking-wide text-slate-600 ${
                  i >= 5 ? "bg-slate-100/70" : ""
                }`}
              >
                <span className="hidden sm:inline">{w}</span>
                <span className="sm:hidden">{w[0]}</span>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={bodyKey}
            custom={dir}
            initial={{ opacity: 0, x: dir === 0 ? 0 : dir > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir > 0 ? -40 : 40 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) step(1);
              else if (info.offset.x > 60) step(-1);
            }}
          >
            {view === "month" ? (
              <div
                role="grid"
                aria-label="Month view. Use arrow keys to move between days."
                className="grid grid-cols-7 divide-x divide-y divide-slate-100"
              >
                {/*
                  ARIA grid requires grid > row > gridcell. The cells were
                  previously direct children of role="grid", which axe flags as
                  aria-required-children / aria-required-parent (critical) and
                  which stops a screen reader announcing row and column
                  position at all. `display: contents` lets the row exist in the
                  accessibility tree without taking part in the CSS grid, so the
                  7-column layout is unchanged.
                */}
                {Array.from({ length: Math.ceil(monthDays.length / 7) }).map(
                  (_, weekIndex) => (
                    <div
                      key={`week-${weekIndex}`}
                      role="row"
                      style={{ display: "contents" }}
                    >
                {monthDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((d, dayIndex) => {
                  const i = weekIndex * 7 + dayIndex;
                  const iso = toISODate(d);
                  const col = i % 7;
                  const row = Math.floor(i / 7);
                  const inMonth = d.getMonth() === anchor.getMonth();
                  const isWeekend = col >= 5;
                  const isCurrentWeek =
                    toISODate(mondayOf(d)) === todayWeekKey;
                  const dayEvents = eventsByDay.get(iso) ?? [];
                  const isToday = iso === today;
                  const isSelected = iso === selectedDay;
                  const clickable = dayEvents.length > 0;

                  const cellBg = isCurrentWeek
                    ? "bg-crescent-50/50"
                    : !inMonth
                      ? "bg-slate-50/50"
                      : isWeekend
                        ? "bg-slate-50/50"
                        : "bg-white";

                  const numberStyle =
                    isSelected && isToday
                      ? "bg-accent-500 text-white ring-2 ring-crescent-600 ring-offset-1"
                      : isSelected
                        ? "bg-accent-500 text-white"
                        : isToday
                          ? "bg-crescent-700 text-white"
                          : inMonth
                            ? "font-semibold text-slate-800"
                            : "font-normal text-slate-600";

                  const tip = tipPlacement(row, col);

                  return (
                    <div key={iso} role="gridcell" className={`relative ${cellBg}`}>
                      <motion.button
                        type="button"
                        ref={(el) => grid.register(iso, el)}
                        // aria-disabled rather than disabled: an empty day has
                        // nothing to activate, but it must still be reachable
                        // by arrow keys or most of the month is unnavigable.
                        aria-disabled={!clickable}
                        tabIndex={grid.tabStopIso === iso ? 0 : -1}
                        onFocus={() => grid.setFocusedIso(iso)}
                        onKeyDown={(e) => grid.onKeyDown(e, d)}
                        whileTap={clickable ? { scale: 0.95 } : undefined}
                        transition={{ duration: 0.15 }}
                        onClick={() =>
                          clickable && onSelectDay(isSelected ? null : iso)
                        }
                        onMouseEnter={() => setHovered(iso)}
                        onMouseLeave={() =>
                          setHovered((h) => (h === iso ? null : h))
                        }
                        aria-pressed={isSelected}
                        aria-label={`${d.toLocaleDateString("en-IN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })} — ${dayEvents.length} event${
                          dayEvents.length === 1 ? "" : "s"
                        }`}
                        className={`flex h-full min-h-[3.5rem] w-full flex-col items-center gap-1 p-1 transition-colors duration-200 md:min-h-[5rem] md:p-1.5 ${
                          clickable
                            ? "cursor-pointer hover:bg-crescent-50"
                            : "cursor-default"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] transition-colors duration-200 md:h-7 md:w-7 md:text-xs ${numberStyle}`}
                        >
                          {d.getDate()}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="flex flex-wrap items-center justify-center gap-0.5 md:gap-1">
                            {dayEvents.slice(0, 3).map((e) => (
                              <span
                                key={e.id}
                                className={`h-2 w-2 rounded-full ${catDot(
                                  e.category
                                )} ${catGlow(e.category)}`}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="hidden text-[0.6rem] font-medium text-slate-600 sm:inline">
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </span>
                        )}
                      </motion.button>

                      {hovered === iso && dayEvents.length > 0 && (
                        <div
                          className={`pointer-events-none absolute z-40 hidden w-52 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl md:block ${tip.wrap}`}
                        >
                          <span
                            className={`absolute h-2 w-2 rotate-45 border-slate-200 bg-white ${tip.caret}`}
                          />
                          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-600">
                            {d.toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {dayEvents.slice(0, 5).map((e) => (
                              <li
                                key={e.id}
                                className="flex items-start gap-1.5 text-xs text-slate-600"
                              >
                                <span
                                  className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${catDot(
                                    e.category
                                  )}`}
                                />
                                <span className="line-clamp-1">{e.title}</span>
                              </li>
                            ))}
                          </ul>
                          {dayEvents.length > 5 && (
                            <p className="mt-1 text-[0.7rem] text-slate-600">
                              +{dayEvents.length - 5} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                    </div>
                  )
                )}
              </div>
            ) : (
              <>
                {/* Week — desktop: 7 columns */}
                <div className="hidden gap-2 p-3 md:grid md:grid-cols-7">
                  {weekDays.map((d) => {
                    const iso = toISODate(d);
                    const dayEvents = eventsByDay.get(iso) ?? [];
                    const isToday = iso === today;
                    const isSelected = iso === selectedDay;
                    return (
                      <div
                        key={iso}
                        className="flex min-h-[11rem] flex-col overflow-hidden rounded-xl border border-slate-200"
                      >
                        <button
                          type="button"
                          disabled={dayEvents.length === 0}
                          onClick={() => onSelectDay(isSelected ? null : iso)}
                          className={`flex items-center justify-between px-2.5 py-2 text-left transition-colors duration-200 ${
                            isSelected
                              ? "bg-accent-500 text-white"
                              : isToday
                                ? "bg-crescent-700 text-white"
                                : "bg-slate-50 text-slate-600"
                          } ${dayEvents.length ? "cursor-pointer" : "cursor-default"}`}
                        >
                          <span className="text-[0.7rem] font-semibold uppercase tracking-wide">
                            {d.toLocaleDateString("en-IN", { weekday: "short" })}
                          </span>
                          <span className="text-sm font-bold">{d.getDate()}</span>
                        </button>
                        <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
                          {dayEvents.length === 0 && (
                            <p className="pt-3 text-center text-[0.7rem] text-slate-600">
                              —
                            </p>
                          )}
                          {dayEvents.map((e) => (
                            <div
                              key={e.id}
                              className={`rounded-lg p-2 text-[0.7rem] leading-tight ${eventCategoryColor[e.category].soft}`}
                            >
                              <p className="flex items-center gap-1 font-semibold">
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${catDot(
                                    e.category
                                  )}`}
                                />
                                <span className="line-clamp-2">{e.title}</span>
                              </p>
                              <p className="mt-0.5 line-clamp-1 opacity-70">
                                {e.institution_name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Week — mobile: vertical day list */}
                <div className="divide-y divide-slate-100 md:hidden">
                  {weekDays.map((d) => {
                    const iso = toISODate(d);
                    const dayEvents = eventsByDay.get(iso) ?? [];
                    const isToday = iso === today;
                    const isSelected = iso === selectedDay;
                    return (
                      <div key={iso} className="p-3">
                        <button
                          type="button"
                          disabled={dayEvents.length === 0}
                          onClick={() => onSelectDay(isSelected ? null : iso)}
                          className="flex min-h-[44px] w-full items-center gap-2 text-left"
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
                              isSelected
                                ? "bg-accent-500 text-white"
                                : isToday
                                  ? "bg-crescent-700 text-white"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {d.getDate()}
                          </span>
                          <span className="text-sm font-semibold text-crescent-800">
                            {d.toLocaleDateString("en-IN", { weekday: "long" })}
                          </span>
                          <span className="text-xs text-slate-600">
                            {d.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </button>
                        {dayEvents.length === 0 ? (
                          <p className="mt-2 pl-10 text-xs text-slate-600">
                            No events
                          </p>
                        ) : (
                          <ul className="mt-2 space-y-1.5 pl-10">
                            {dayEvents.map((e) => (
                              <li
                                key={e.id}
                                className={`rounded-lg p-2 text-xs ${eventCategoryColor[e.category].soft}`}
                              >
                                <p className="flex items-center gap-1.5 font-semibold">
                                  <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${catDot(
                                      e.category
                                    )}`}
                                  />
                                  {e.title}
                                </p>
                                <p className="mt-0.5 opacity-70">
                                  {e.institution_name}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-2 text-center text-[0.7rem] text-slate-600 md:hidden">
        Swipe left or right to change {view === "month" ? "month" : "week"}
      </p>
    </section>
  );
}
