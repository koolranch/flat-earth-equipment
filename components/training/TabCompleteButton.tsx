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
      className={className}
    >
      {label} <ArrowRight size={16} />
    </Button>
  );
}
