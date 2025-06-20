"use client";
import { useState } from "react";

export default function InfoTooltip({ content }: { content: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label="Info"
        onClick={() => setOpen(!open)}
        className="h-4 w-4 rounded-full bg-gray-200 text-gray-600 text-[10px] flex items-center justify-center"
      >
        i
      </button>
      {open && (
        <div className="absolute z-20 w-56 p-3 text-xs rounded-md bg-white shadow-xl border border-gray-200 top-6 left-1/2 -translate-x-1/2">
          {content}
        </div>
      )}
    </span>
  );
} 