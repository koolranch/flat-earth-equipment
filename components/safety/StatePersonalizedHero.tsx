"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useEffect } from "react";
import SafetyHero from "./SafetyHero";
import { getStateFromParam } from "@/lib/data/state-data";

/**
 * Reads the `state` URL parameter client-side and passes personalization
 * data to SafetyHero. Wrapped in <Suspense> by the parent page.
 *
 * - Does NOT rewrite or redirect the URL (preserves gclid and all params)
 * - Injects a noindex meta tag when a state param is present so
 *   personalized ad-landing variants are never indexed
 */
export default function StatePersonalizedHero() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");

  const stateData = useMemo(() => getStateFromParam(stateParam), [stateParam]);

  useEffect(() => {
    if (!stateParam) return;

    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, [stateParam]);

  return <SafetyHero stateData={stateData} />;
}
