import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** Flip the palette for use on a navy section ground. */
  onDark?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  onDark = false,
}: SectionHeadingProps) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl text-left"
      }
    >
      {eyebrow && (
        <p
          className={`type-eyebrow mb-3 flex items-center gap-2.5 ${
            align === "center" ? "justify-center" : ""
          } ${onDark ? "text-gold-300" : "text-accent-600"}`}
        >
          {/* Short rule before the eyebrow — a small mark of formality that
              costs nothing and stops the label floating. */}
          <span
            aria-hidden="true"
            className={`h-px w-6 ${onDark ? "bg-gold-300/60" : "bg-accent-600/40"}`}
          />
          {eyebrow}
        </p>
      )}
      <h2
        className={`type-h2 text-balance ${
          onDark ? "text-white" : "text-crescent-800"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-pretty leading-relaxed ${
            onDark ? "text-crescent-100" : "text-slate-600"
          } ${align === "center" ? "mx-auto" : ""} max-w-[62ch]`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
