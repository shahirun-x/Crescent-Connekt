"use client";

import type { Institution } from "@/lib/types";

export function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-crescent-500 focus:outline-none focus:ring-2 focus:ring-crescent-500/20"
      />
    </div>
  );
}

/**
 * Textarea with a live character counter. Values keep their raw newlines;
 * the public site renders them with `whitespace-pre-line`.
 */
export function TextareaField({
  label,
  value,
  onChange,
  rows = 6,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="block text-xs font-medium text-slate-600">{label}</label>
        <span className="text-xs tabular-nums text-slate-500">
          {value.length} characters
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-crescent-500 focus:outline-none focus:ring-2 focus:ring-crescent-500/20"
      />
      <p className="mt-1 text-xs text-slate-500">Line breaks are preserved.</p>
    </div>
  );
}

/**
 * Institution picker. Submits `institution_id` (nullable) — never a name,
 * since neither the events nor the news table stores institution names.
 */
export function InstitutionSelect({
  value,
  onChange,
  institutions,
}: {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  institutions: Institution[];
}) {
  const sorted = [...institutions].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        Institution
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-crescent-500 focus:outline-none focus:ring-2 focus:ring-crescent-500/20"
      >
        <option value="">— No specific institution (network-wide) —</option>
        {sorted.map((inst) => (
          <option key={inst.id} value={inst.id}>
            {inst.name}
          </option>
        ))}
      </select>
    </div>
  );
}
