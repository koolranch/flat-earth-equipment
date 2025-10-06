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
    <Button
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      aria-label={rest["aria-label"] ?? label}
      className={`
        px-6 py-3 sm:px-4 sm:py-2 
        bg-canyon-rust text-white 
        hover:bg-canyon-rust/90 
        rounded-xl font-semibold 
        shadow-md hover:shadow-lg 
        transition-all duration-200
        touch-manipulation
        active:scale-[0.98]
        text-sm sm:text-sm
        min-h-[44px] sm:min-h-auto
        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <ArrowRight size={16} />
      </div>
    </Button>
  );
}
