"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TabCompleteButton(props: {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const { label, onClick, className, disabled, ...rest } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={rest["aria-label"] ?? label}
      className={`
        inline-flex items-center gap-3
        px-6 py-4 sm:px-5 sm:py-3
        bg-canyon-rust text-white 
        hover:bg-canyon-rust/90 
        disabled:bg-slate-300 disabled:text-slate-500
        rounded-xl font-semibold 
        shadow-lg hover:shadow-xl 
        transition-all duration-200
        touch-manipulation
        active:scale-[0.98]
        text-base sm:text-sm
        min-h-[48px] sm:min-h-[44px]
        border-2 border-canyon-rust hover:border-canyon-rust/90
        focus:outline-none focus:ring-2 focus:ring-canyon-rust focus:ring-offset-2
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span className="font-semibold">{label}</span>
      <ArrowRight size={18} className="flex-shrink-0" />
    </button>
  );
}
