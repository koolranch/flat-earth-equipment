"use client";

type Props = {
  size?: number;        // pixel size of square mark (default 20)
  inverse?: boolean;    // white on dark headers
  ring?: boolean;       // subtle rounded badge background
  className?: string;
  title?: string;
};

export default function MonogramFE({
  size = 20,
  inverse = false,
  ring = true,
  className = "",
  title = "FE monogram",
}: Props) {
  const stroke = inverse ? "#FFFFFF" : "#0F172A";
  const accent = "#F76511";
  const bgFill = inverse ? "rgba(255,255,255,0.06)" : "#FFF7ED";
  const bgStroke = inverse ? "rgba(255,255,255,0.28)" : "#E2E8F0";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-label={title}
      role="img"
      className={className}
    >
      {ring && (
        <rect x="1" y="1" width="30" height="30" rx="6" fill={bgFill} stroke={bgStroke} />
      )}
      {/* F stem */}
      <rect x="8" y="7" width="3" height="18" rx="1.5" fill={stroke} />
      {/* F top bar */}
      <rect x="11" y="7" width="12" height="3" rx="1.5" fill={stroke} />
      {/* F mid bar (shorter) */}
      <rect x="11" y="14" width="9" height="3" rx="1.5" fill={stroke} />
      {/* E bars (share the same stem visually) */}
      <rect x="11" y="11" width="12" height="3" rx="1.5" fill={stroke} opacity="0.0001" />
      <rect x="11" y="18" width="12" height="3" rx="1.5" fill={stroke} />
      {/* E bottom bar in brand orange (reads as 'equipment/earth/tine') */}
      <rect x="11" y="22" width="12" height="3" rx="1.5" fill={accent} />
    </svg>
  );
}

