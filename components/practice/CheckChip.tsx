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
        "group relative overflow-hidden w-full select-none rounded-xl border-2 px-5 py-4 text-left text-sm md:text-base transition-all",
        "min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        checked
          ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 shadow-md text-orange-900 focus-visible:ring-[#F76511]"
          : "bg-white border-slate-200 text-slate-700 hover:border-[#F76511] hover:shadow-md focus-visible:ring-slate-400",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      ].join(" ")}
    >
      {/* Orange accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${checked ? 'bg-[#F76511]' : 'bg-transparent'}`}></div>
      
      <span className="inline-flex items-center gap-3">
        <span
          aria-hidden
          className={[
            "inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
            checked 
              ? "bg-gradient-to-br from-[#F76511] to-orange-600 border-orange-600" 
              : "bg-white border-slate-300 group-hover:border-[#F76511]"
          ].join(" ")}
        >
          {checked ? (
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-white" fill="currentColor">
              <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.3 9.5A1 1 0 1 1 4.7 8.1l3 3 6.5-6.5a1 1 0 0 1 1.5 0Z" />
            </svg>
          ) : null}
        </span>
        <span className="font-semibold">{label}</span>
      </span>
    </button>
  );
}
