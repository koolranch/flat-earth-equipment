import { MetadataRoute } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { forkliftStates } from "@/src/data/forkliftStates";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = supabaseServer();
  const { data } = await sb
    .from("parts")
    .select("slug, updated_at, category_slug")
    .eq("category_slug", "battery-chargers")
    .order("slug", { ascending: true })
    .limit(1000);

  const base = "https://www.flatearthequipment.com";
  const chargerItems = (data ?? []).map((p) => ({
    url: `${base}/chargers/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Core site pages
  const corePages = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${base}/battery-chargers`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${base}/safety`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${base}/safety/forklift`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${base}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  // All 50 state forklift certification pages
  const statePages = forkliftStates.map((state) => ({
    url: `${base}/safety/forklift/${state.code}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...corePages,
    ...statePages,
    ...chargerItems
  ];
}
