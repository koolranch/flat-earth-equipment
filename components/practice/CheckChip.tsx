import * as React from "react";

type CheckChipProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  testId?: string;
};

export function CheckChip({ label, checked, onToggle, disabled, testId }: CheckChipProps) {
  // Accessible "checkbox" using a button
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      data-testid={testId}
      disabled={disabled}
      onClick={() => !disabled && onToggle()}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={[
        "w-full select-none rounded-xl border px-4 py-3 text-left text-sm md:text-base transition",
        "min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        checked
          ? "bg-green-50 border-green-500 text-green-800 focus-visible:ring-green-500"
          : "bg-slate-50  border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      ].join(" ")}
    >
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden
          className={[
            "inline-flex h-5 w-5 items-center justify-center rounded-full border transition",
            checked ? "bg-green-600 border-green-600" : "bg-white border-slate-300"
          ].join(" ")}
        >
          {checked ? (
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white" fill="currentColor">
              <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.3 9.5A1 1 0 1 1 4.7 8.1l3 3 6.5-6.5a1 1 0 0 1 1.5 0Z" />
            </svg>
          ) : null}
        </span>
        <span>{label}</span>
      </span>
    </button>
  );
}
