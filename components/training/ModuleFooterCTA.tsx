"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <Button disabled variant="secondary">
          {label}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {enabled ? (
        <Link href={nextHref} className="inline-block">
          <Button variant="primary" aria-label={label}>
            {label}
          </Button>
        </Link>
      ) : (
        <Button
          disabled
          variant="secondary"
          aria-label={`${label} (locked until all steps complete)`}
        >
          {label}
        </Button>
      )}
    </div>
  );
}
