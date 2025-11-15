"use client";

import MonogramFE from "@/components/brand/MonogramFE";

type Props = {
  showWordmark?: boolean;   // desktop true, mobile false
  inverse?: boolean;
  className?: string;
  label?: string;           // accessible name
};

export default function Logo({
  showWordmark = true,
  inverse = false,
  className = "",
  label = "Flat Earth Equipment",
}: Props) {
  const textColor = inverse ? "#FFFFFF" : "#0F172A";
  const accent = "#F76511";
  
  // Dynamically scale monogram based on className height
  const iconSize = className.includes('h-8') ? 32 : 20;

  return (
    <div
      className={`flex items-center gap-2.5 ${className}`}
      role="img"
      aria-label={label}
      style={{ lineHeight: 0 }}
    >
      <MonogramFE size={iconSize} inverse={inverse} ring />
      {showWordmark && (
        <svg 
          width="186" 
          height={iconSize} 
          viewBox="0 0 186 20" 
          preserveAspectRatio="xMinYMid meet"
          aria-hidden="true" 
          style={{ transform: "translateY(1px)" }}
        >
          <text
            x="0"
            y="15"
            fontFamily="Inter, ui-sans-serif, system-ui"
            fontWeight="800"
            fontSize="14"
            letterSpacing="0.2"
            fill={textColor}
          >
            Flat Earth <tspan fill={accent}>Equipment</tspan>
          </text>
        </svg>
      )}
    </div>
  );
}

