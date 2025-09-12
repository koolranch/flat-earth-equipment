"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function ModuleFooterCTA(props: {
  nextHref: string; // or "" if last module
  enabled: boolean;
  isLast?: boolean;
}) {
  const { nextHref, enabled, isLast } = props;
  const label = isLast ? "Finish Course" : "Continue to next module";

  if (!nextHref) {
    return (
      <div className="mt-6">
        <button
          disabled
          className="rounded-md bg-slate-200 px-4 py-2 text-slate-500 cursor-not-allowed"
        >
          {label}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {enabled ? (
        <Link
          href={nextHref}
          className="inline-flex items-center rounded-md bg-amber-700 px-4 py-2 text-white hover:bg-amber-800"
          aria-label={label}
        >
          {label}
        </Link>
      ) : (
        <button
          disabled
          className="rounded-md bg-slate-200 px-4 py-2 text-slate-500 cursor-not-allowed"
          aria-label={`${label} (locked until all steps complete)`}
        >
          {label}
        </button>
      )}
    </div>
  );
}
