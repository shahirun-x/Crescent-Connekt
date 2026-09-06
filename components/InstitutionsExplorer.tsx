"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InstitutionCard from "./InstitutionCard";
import type { Category, Institution } from "@/lib/types";

const validCategories = ["education", "healthcare", "community", "innovation"];

const filters: { value: "all" | Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "community", label: "Community" },
  { value: "innovation", label: "Innovation" },
];

export default function InstitutionsExplorer({
  institutions,
}: {
  institutions: Institution[];
}) {
  const [active, setActive] = useState<"all" | Category>("all");
  const [query, setQuery] = useState("");

  // Honour a ?category= deep link (e.g. from the home page ecosystem cards)
  // without opting the route out of static generation.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("category");
    if (fromUrl && validCategories.includes(fromUrl)) {
      setActive(fromUrl as Category);
    }
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return institutions.filter((i) => {
      const matchesCat = active === "all" || i.category === active;
      const matchesQuery =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [institutions, active, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={active === f.value}
              onClick={() => setActive(f.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active === f.value
                  ? "bg-crescent-700 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-crescent-300 hover:text-crescent-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative md:w-72">
          <span className="sr-only">Search institutions</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or place…"
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-4 pr-4 text-sm outline-none focus:border-crescent-400"
          />
        </label>
      </div>

      <p className="mt-4 text-sm text-slate-500" aria-live="polite">
        {results.length} institution{results.length === 1 ? "" : "s"}
      </p>

      <motion.ul layout className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((inst) => (
            <motion.li
              key={inst.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
            >
              <InstitutionCard inst={inst} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {results.length === 0 && (
        <p className="mt-10 rounded-card border border-dashed border-control p-10 text-center text-sm text-slate-500">
          No institutions match that filter yet.
        </p>
      )}
    </div>
  );
}
