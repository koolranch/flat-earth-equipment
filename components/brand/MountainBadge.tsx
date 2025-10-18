"use client";

type Props = {
  width?: number;       // default 128
  inverse?: boolean;
  className?: string;
  title?: string;
};

export default function MountainBadge({
  width = 128,
  inverse = false,
  className = "",
  title = "Flat Earth Equipment badge",
}: Props) {
  const slate = inverse ? "#FFFFFF" : "#0F172A";
  const accent = "#F76511";
  const sky = inverse ? "rgba(255,255,255,0.06)" : "#FFF7ED";

  // Maintain 4:3 badge ratio
  const height = Math.round((width * 3) / 4);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 120"
      aria-label={title}
      role="img"
      className={className}
    >
      <rect x="2" y="2" width="156" height="116" rx="14" fill={sky} stroke="#E2E8F0" />
      {/* Mountains (simple, legible shapes) */}
      <path d="M10 88 L50 40 L82 84 Z" fill={slate} />
      <path d="M60 88 L100 32 L150 88 Z" fill={slate} opacity="0.88" />
      {/* Star */}
      <circle cx="124" cy="26" r="3" fill={accent} />
      {/* Subtle forklift silhouette on baseline (simple geometry) */}
      <rect x="22" y="92" width="44" height="4" fill={slate} />
      <circle cx="30" cy="96" r="6" fill={slate} />
      <circle cx="58" cy="96" r="6" fill={slate} />
      <rect x="34" y="82" width="6" height="12" fill={slate} />
      <rect x="40" y="80" width="20" height="6" fill={slate} />
      <rect x="60" y="78" width="4" height="14" fill={accent} />
      {/* Wordmark (optional) */}
      <text x="10" y="112" fontFamily="Inter, ui-sans-serif" fontWeight="800" fontSize="12" fill={slate}>
        Flat Earth <tspan fill={accent}>Equipment</tspan>
      </text>
    </svg>
  );
}

