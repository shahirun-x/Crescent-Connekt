"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKET = "media";

function sanitizeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "jpg";
  const safeBase =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";
  return `${safeBase}.${ext.replace(/[^a-z0-9]/g, "")}`;
}

export default function ImageUpload({
  value,
  onChange,
  folder,
  label = "Cover Image",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  /** Storage folder prefix, e.g. "events" or "news". */
  folder: string;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");

    if (!ACCEPTED.includes(file.type)) {
      setError("Only JPG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `Image is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is 5MB.`
      );
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const supabase = getBrowserSupabase();
      const path = `${folder}/${Date.now()}-${sanitizeName(file.name)}`;

      setProgress(35);
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(uploadError.message || "Upload failed. Please try again.");
        setUploading(false);
        setProgress(0);
        return;
      }

      setProgress(80);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

      setProgress(100);
      onChange(data.publicUrl);
      setUploading(false);
      setTimeout(() => setProgress(0), 400);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Upload failed. Please try again."
      );
      setUploading(false);
      setProgress(0);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 p-2">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-slate-100">
            <Image
              src={value}
              alt="Uploaded preview"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-500">{value}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setError("");
            }}
            className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragging
              ? "border-crescent-500 bg-crescent-50"
              : "border-slate-300 hover:border-crescent-400 hover:bg-slate-50"
          }`}
        >
          {uploading ? (
            <>
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-crescent-200 border-t-crescent-600" />
              <p className="mt-2 text-xs text-slate-500">
                Uploading… {progress}%
              </p>
              <div className="mt-2 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-crescent-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-600">
                Drop an image here, or click to browse
              </p>
              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG or WebP · max 5MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
