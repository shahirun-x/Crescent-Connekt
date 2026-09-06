interface LogoProps {
  className?: string;
  withWordmark?: boolean;
}

/**
 * Crescent Global emblem — a crescent moon over a globe, in Crescent blue with a
 * red accent. Rendered as inline SVG so it costs no extra request and scales
 * crisply at every breakpoint.
 */
export default function Logo({ className, withWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        viewBox="0 0 48 48"
        role="img"
        aria-label="Crescent Global"
        className="h-9 w-9 shrink-0"
      >
        <circle cx="24" cy="24" r="22" fill="var(--color-crescent-700)" />
        <path
          d="M24 8a16 16 0 1 0 0 32 13 13 0 1 1 0-32Z"
          fill="#ffffff"
        />
        <circle cx="33" cy="15" r="3.4" fill="var(--color-accent-500)" />
        <g stroke="var(--color-crescent-200)" strokeWidth="1.1" fill="none" opacity="0.55">
          <ellipse cx="24" cy="24" rx="21" ry="8" />
          <line x1="3" y1="24" x2="45" y2="24" />
        </g>
      </svg>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[1.05rem] font-bold tracking-tight text-crescent-800">
            Crescent Global
          </span>
          <span className="text-[0.66rem] font-medium uppercase tracking-[0.18em] text-crescent-600">
            One Network
          </span>
        </span>
      )}
    </span>
  );
}
