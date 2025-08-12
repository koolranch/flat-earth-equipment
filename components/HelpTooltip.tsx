"use client";

import { useState } from "react";
import { Info } from "lucide-react";

type Props = {
  content: string;
  className?: string;
};

export default function HelpTooltip({ content, className = "" }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        className="inline-flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        <Info className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 text-xs text-white bg-neutral-800 rounded-lg shadow-lg -top-2 left-6 transform -translate-y-full">
          <div className="absolute top-full left-2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-neutral-800"></div>
          </div>
          {content}
        </div>
      )}
    </div>
  );
}
