"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  MEMBER_ROLES,
  ROLES_WITH_BATCH_YEAR,
  roleMeta,
  type MemberRole,
} from "@/lib/roles";
import type { Institution } from "@/lib/types";

export interface ProfileDraft {
  full_name: string;
  role: MemberRole | "";
  institution_id: string | null;
  batch_year: string;
  current_city: string;
  current_country: string;
  headline: string;
  bio: string;
  avatar_url: string | null;
  linkedin_url: string;
  phone: string;
  show_email: boolean;
  show_phone: boolean;
}

export const EMPTY_DRAFT: ProfileDraft = {
  full_name: "",
  role: "",
  institution_id: null,
  batch_year: "",
  current_city: "",
  current_country: "India",
  headline: "",
  bio: "",
  avatar_url: null,
  linkedin_url: "",
  phone: "",
  show_email: false,
  show_phone: false,
};

const STEPS = ["About you", "Where you're from", "Your profile"];

export default function ProfileForm({
  initial,
  mode,
  redirectTo,
}: {
  initial: ProfileDraft;
  mode: "create" | "edit";
  /** Where to go after a successful save. */
  redirectTo: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<ProfileDraft>(initial);
  const [step, setStep] = useState(0);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit mode shows every field on one page — no wizard for people who are
  // already members and just want to change one thing.
  const wizard = mode === "create";

  useEffect(() => {
    fetch("/api/connect/institutions")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setInstitutions(j.data ?? []))
      .catch(() => setInstitutions([]));
  }, []);

  const set = <K extends keyof ProfileDraft>(k: K, v: ProfileDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const showBatchYear =
    draft.role !== "" && ROLES_WITH_BATCH_YEAR.includes(draft.role);

  function validateStep(s: number): string {
    if (s === 0) {
      if (draft.full_name.trim().length < 2) return "Please enter your full name.";
      if (!draft.role) return "Please choose the role that best describes you.";
    }
    return "";
  }

  function next() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit() {
    for (let s = 0; s <= (wizard ? STEPS.length - 1 : 0); s++) {
      const msg = validateStep(s);
      if (msg) {
        setError(msg);
        setStep(s);
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/connect/profile", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          batch_year: showBatchYear && draft.batch_year ? draft.batch_year : null,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Could not save your profile.");
        setSaving(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  const sorted = [...institutions].sort((a, b) => a.name.localeCompare(b.name));
  const visible = (s: number) => !wizard || step === s;

  return (
    <div>
      {wizard && (
        <div className="mb-8">
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i < step
                      ? "bg-crescent-700 text-white"
                      : i === step
                        ? "bg-crescent-700 text-white ring-4 ring-crescent-100"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 rounded ${
                      i < step ? "bg-crescent-700" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold text-crescent-800">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* ---------------- Step 1 ---------------- */}
        {visible(0) && (
          <div className="space-y-5">
            {!wizard && <SectionTitle>About you</SectionTitle>}
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                value={draft.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-slate-700">
                Which best describes you?
              </legend>
              <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                {MEMBER_ROLES.map((r) => {
                  const meta = roleMeta[r];
                  const active = draft.role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set("role", r)}
                      aria-pressed={active}
                      className={`flex items-start gap-3 rounded-card border p-3.5 text-left transition-all ${
                        active
                          ? "border-crescent-500 bg-crescent-50/60 ring-2 ring-crescent-500/20"
                          : "border-slate-200 bg-white hover:border-crescent-300 hover:shadow-sm"
                      }`}
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-crescent-800">
                          {meta.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                          {meta.blurb}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}

        {/* ---------------- Step 2 ---------------- */}
        {visible(1) && (
          <div className="space-y-5">
            {!wizard && <SectionTitle>Where you&apos;re from</SectionTitle>}
            <label className="block text-sm font-medium text-slate-700">
              Institution
              <select
                value={draft.institution_id ?? ""}
                onChange={(e) => set("institution_id", e.target.value || null)}
                className="mt-1 w-full rounded-lg border border-control bg-white px-3 py-2 text-sm outline-none focus:border-crescent-400"
              >
                <option value="">
                  Not affiliated with a specific institution
                </option>
                {sorted.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>

            {showBatchYear && (
              <label className="block text-sm font-medium text-slate-700">
                Batch year
                <input
                  type="number"
                  value={draft.batch_year}
                  onChange={(e) => set("batch_year", e.target.value)}
                  min={1950}
                  max={new Date().getFullYear() + 10}
                  placeholder="e.g. 2019"
                  className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Year of graduation, or expected graduation.
                </span>
              </label>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Current city
                <input
                  value={draft.current_city}
                  onChange={(e) => set("current_city", e.target.value)}
                  placeholder="Chennai"
                  className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Country
                <input
                  value={draft.current_country}
                  onChange={(e) => set("current_country", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
                />
              </label>
            </div>
          </div>
        )}

        {/* ---------------- Step 3 ---------------- */}
        {visible(2) && (
          <div className="space-y-5">
            {!wizard && <SectionTitle>Your profile</SectionTitle>}

            <ImageUpload
              label="Profile photo"
              folder="avatars"
              value={draft.avatar_url}
              onChange={(url) => set("avatar_url", url)}
            />

            <label className="block text-sm font-medium text-slate-700">
              Headline
              <input
                value={draft.headline}
                onChange={(e) => set("headline", e.target.value)}
                maxLength={160}
                placeholder="Software engineer at Zoho · Crescent CSE 2019"
                className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                One line, shown on your directory card. {draft.headline.length}/160
              </span>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              About you <span className="font-normal text-slate-500">(optional)</span>
              <textarea
                value={draft.bio}
                onChange={(e) => set("bio", e.target.value)}
                rows={5}
                maxLength={2000}
                className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                {draft.bio.length}/2000 · Line breaks are preserved.
              </span>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              LinkedIn <span className="font-normal text-slate-500">(optional)</span>
              <input
                type="url"
                value={draft.linkedin_url}
                onChange={(e) => set("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Phone <span className="font-normal text-slate-500">(optional)</span>
              <input
                type="tel"
                value={draft.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
              />
            </label>

            <fieldset className="rounded-card border border-slate-200 bg-slate-50 p-4">
              <legend className="px-1 text-sm font-semibold text-crescent-800">
                Privacy
              </legend>
              <p className="text-xs leading-relaxed text-slate-500">
                Your contact details are hidden from other members unless you
                turn them on here. You can change this any time.
              </p>
              <div className="mt-3 space-y-2.5">
                <Toggle
                  checked={draft.show_email}
                  onChange={(v) => set("show_email", v)}
                  label="Show my email to other approved members"
                />
                <Toggle
                  checked={draft.show_phone}
                  onChange={(v) => set("show_phone", v)}
                  label="Show my phone number to other approved members"
                />
              </div>
            </fieldset>
          </div>
        )}
      </div>

      {error && (
        <p
          className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mt-7 flex items-center justify-between gap-3">
        {wizard && step > 0 ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep((s) => s - 1);
            }}
            className="rounded-full border border-control px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Back
          </button>
        ) : (
          <span />
        )}

        {wizard && step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-full bg-crescent-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crescent-800"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="rounded-full bg-crescent-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-crescent-800 disabled:opacity-60"
          >
            {saving
              ? "Saving…"
              : mode === "create"
                ? "Submit for review"
                : "Save changes"}
          </button>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-slate-200 pb-2 text-base font-bold text-crescent-800">
      {children}
    </h2>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-control accent-crescent-700"
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}
