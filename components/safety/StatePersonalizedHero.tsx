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
 * - Injects a noindex meta tag whenever ANY query param is present so the
 *   personalized + ad-tagged variants are never indexed as duplicates of
 *   the canonical /safety landing page.
 */
export default function StatePersonalizedHero() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");

  const stateData = useMemo(() => getStateFromParam(stateParam), [stateParam]);
  const normalizedStateParam = useMemo(() => {
    if (!stateParam) return null;
    return stateParam.toLowerCase().trim();
  }, [stateParam]);

  const hasAnyParam = useMemo(() => {
    if (!searchParams) return false;
    const str = searchParams.toString();
    return str.length > 0;
  }, [searchParams]);

  useEffect(() => {
    if (!hasAnyParam) return;

    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, [hasAnyParam]);

  return <SafetyHero stateData={stateData} stateParam={normalizedStateParam} />;
}
