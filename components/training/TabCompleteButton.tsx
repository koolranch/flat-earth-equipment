"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
        disabled
          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
          : "bg-amber-700 text-white hover:bg-amber-800",
        className
      )}
    >
      {label} <ArrowRight size={16} />
    </button>
  );
}
