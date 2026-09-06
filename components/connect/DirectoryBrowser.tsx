"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MemberCard, { type DirectoryMember } from "./MemberCard";
import { MEMBER_ROLES, roleMeta, type MemberRole } from "@/lib/roles";

interface InstitutionOption {
  id: string;
  name: string;
}

export default function DirectoryBrowser() {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [roles, setRoles] = useState<MemberRole[]>([]);
  const [institution, setInstitution] = useState("");
  const [city, setCity] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [showFilters, setShowFilters] = useState(false);

  const firstLoad = useRef(true);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (debounced) p.set("q", debounced);
    if (roles.length) p.set("roles", roles.join(","));
    if (institution) p.set("institution", institution);
    if (city) p.set("city", city);
    if (yearFrom) p.set("yearFrom", yearFrom);
    if (yearTo) p.set("yearTo", yearTo);
    p.set("sort", sort);
    return p;
  }, [debounced, roles, institution, city, yearFrom, yearTo, sort]);

  const load = useCallback(
    async (targetPage: number, append: boolean) => {
      setLoading(true);
      setError("");
      try {
        const p = new URLSearchParams(query);
        p.set("page", String(targetPage));
        const res = await fetch(`/api/connect/directory?${p}`);

        if (res.status === 401) {
          setError("Your session has expired. Please sign in again.");
          setLoading(false);
          return;
        }
        if (res.status === 403) {
          setError("Your membership is not approved yet.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.error ?? "Could not load the directory.");
          setLoading(false);
          return;
        }

        const json = await res.json();
        setMembers((prev) => (append ? [...prev, ...json.data] : json.data));
        setCount(json.count);
        setHasMore(json.hasMore);
        setPage(targetPage);
      } catch {
        setError("Could not load the directory. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  // Reload from page 0 whenever a filter changes.
  useEffect(() => {
    load(0, false);
  }, [load]);

  useEffect(() => {
    fetch("/api/connect/institutions")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setInstitutions(j.data ?? []))
      .catch(() => {});
    firstLoad.current = false;
  }, []);

  const activeFilters =
    roles.length + (institution ? 1 : 0) + (city ? 1 : 0) + (yearFrom ? 1 : 0) + (yearTo ? 1 : 0);

  function clearAll() {
    setRoles([]);
    setInstitution("");
    setCity("");
    setYearFrom("");
    setYearTo("");
    setSearch("");
  }

  function toggleRole(r: MemberRole) {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  return (
    <div>
      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, headline or institution…"
            className="w-full rounded-full border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-crescent-400"
          />
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            ⌕
          </span>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "recent" | "name")}
          className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-crescent-400"
        >
          <option value="recent">Recently joined</option>
          <option value="name">Name A–Z</option>
        </select>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeFilters
              ? "border-crescent-300 bg-crescent-50 text-crescent-800"
              : "border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Filters{activeFilters ? ` (${activeFilters})` : ""}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-4 rounded-card border border-slate-200 bg-slate-50 p-5">
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Role
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {MEMBER_ROLES.map((r) => {
                const active = roles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleRole(r)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-crescent-700 text-white"
                        : "border border-slate-300 bg-white text-slate-600 hover:border-crescent-300"
                    }`}
                  >
                    {roleMeta[r].label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Institution
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-crescent-400"
              >
                <option value="">All institutions</option>
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              City
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Any city"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-crescent-400"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Batch from
              <input
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="1990"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-crescent-400"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Batch to
              <input
                type="number"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                placeholder="2026"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-crescent-400"
              />
            </label>
          </div>

          {activeFilters > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 text-xs font-semibold text-crescent-700 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Result count */}
      {!error && (
        <p className="mt-6 text-sm text-slate-500">
          {loading && members.length === 0
            ? "Loading members…"
            : `${count} member${count === 1 ? "" : "s"}`}
        </p>
      )}

      {error && (
        <div
          className="mt-6 rounded-card border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          role="alert"
        >
          <p className="font-semibold">Couldn&apos;t load the directory</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Grid */}
      {!error && (
        <>
          {loading && members.length === 0 ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-64 animate-pulse flex-col items-center rounded-card border border-slate-200 bg-white p-6"
                >
                  <div className="h-20 w-20 rounded-full bg-slate-100" />
                  <div className="mt-4 h-4 w-28 rounded bg-slate-100" />
                  <div className="mt-3 h-3 w-20 rounded bg-slate-100" />
                  <div className="mt-4 h-3 w-full rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <EmptyState hasFilters={activeFilters > 0 || !!debounced} onClear={clearAll} />
          ) : (
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {members.map((m) => (
                <li key={m.id}>
                  <MemberCard member={m} />
                </li>
              ))}
            </ul>
          )}

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => load(page + 1, true)}
                disabled={loading}
                className="rounded-full border border-crescent-300 px-6 py-2.5 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50 disabled:opacity-60"
              >
                {loading ? "Loading…" : "Load more members"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="mt-5 rounded-card border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-crescent-50 text-2xl text-crescent-400">
        ⌕
      </div>
      {hasFilters ? (
        <>
          <h3 className="mt-4 text-base font-semibold text-crescent-800">
            No members match those filters
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Try widening your search — fewer role filters, a broader batch range,
            or a different city.
          </p>
          <button
            type="button"
            onClick={onClear}
            className="mt-5 rounded-full bg-crescent-700 px-5 py-2 text-sm font-semibold text-white hover:bg-crescent-800"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <h3 className="mt-4 text-base font-semibold text-crescent-800">
            The directory is just getting started
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            You&apos;re among the first members of Crescent Connect. As more
            profiles are approved, they&apos;ll appear here.
          </p>
        </>
      )}
    </div>
  );
}
