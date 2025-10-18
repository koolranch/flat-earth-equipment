"use client";

type Props = {
  variant?: "full" | "mark";   // full = mark + wordmark
  inverse?: boolean;           // white for dark headers
  className?: string;
  label?: string;              // accessible name
};

export default function Logo({
  variant = "full",
  inverse = false,
  className = "",
  label = "Flat Earth Equipment",
}: Props) {
  // Colors
  const slate = inverse ? "#FFFFFF" : "#0F172A"; // slate-900
  const accent = "#F76511";                      // safety orange

  // --- Mark (square) ---
  const Mark = (
    <svg width="40" height="40" viewBox="0 0 32 32" aria-hidden="true">
      {/* horizon */}
      <rect x="2" y="22" width="28" height="2" fill={slate} />
      {/* mast */}
      <rect x="8" y="6" width="2" height="16" rx="1" fill={slate} />
      {/* E tines */}
      <rect x="10.5" y="6" width="13.5" height="2" rx="1" fill={slate} />
      <rect x="10.5" y="12" width="11"   height="2" rx="1" fill={slate} />
      <rect x="10.5" y="18" width="13.5" height="2" rx="1" fill={accent} />
      {/* sun */}
      <circle cx="24.5" cy="20.8" r="1.6" fill={accent} />
    </svg>
  );

  // --- Wordmark ---
  const Wordmark = (
    <svg width="184" height="20" viewBox="0 0 184 20" aria-hidden="true">
      <text
        x="0" y="15"
        fontFamily="Inter, ui-sans-serif, system-ui"
        fontWeight="800"
        fontSize="14"
        letterSpacing="0.2"
        fill={slate}
      >
        Flat Earth <tspan fill={accent}>Equipment</tspan>
      </text>
    </svg>
  );

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="img"
      aria-label={label}
      style={{ lineHeight: 0 }}
    >
      {Mark}
      {variant === "full" && Wordmark}
    </div>
  );
}

