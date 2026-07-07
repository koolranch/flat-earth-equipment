import { MetadataRoute } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { forkliftStates } from "@/src/data/forkliftStates";
import { getStateMetrics } from "@/lib/safety/stateMetrics";
import { CART_MODELS } from "@/constants/golfCartModels";
import { CHARGER_MODULES } from "@/constants/chargerOptions";
import * as fs from "fs";
import * as path from "path";

const BASE = "https://www.flatearthequipment.com";

/**
 * Read all MDX blog post slugs from content/insights/ at build time.
 * Files in subdirectories (e.g. rental/, chargers/, construction-equipment-parts/)
 * map to the same /insights/{slug} route since the route handler resolves them.
 */
function getAllInsightSlugs(): Array<{ slug: string; mtime: Date }> {
  const insightsDir = path.resolve(process.cwd(), "content/insights");
  const slugs: Array<{ slug: string; mtime: Date }> = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        // The slug is just the filename without .mdx (subdirectories are
        // organizational only — the route handler ignores them).
        const slug = entry.name.replace(/\.mdx$/, "");
        const stat = fs.statSync(full);
        slugs.push({ slug, mtime: stat.mtime });
      }
    }
  }

  try {
    walk(insightsDir);
  } catch (e) {
    console.warn("Sitemap: failed to walk content/insights:", e);
  }

  // De-duplicate by slug (keep the most recently modified version)
  const map = new Map<string, Date>();
  for (const s of slugs) {
    const existing = map.get(s.slug);
    if (!existing || s.mtime > existing) map.set(s.slug, s.mtime);
  }
  return Array.from(map.entries()).map(([slug, mtime]) => ({ slug, mtime }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = supabaseServer();

  // ── 1. All parts in the database ─────────────────────────────────────────
  // Includes quote-only JCB SEO stubs (those pages exist for indexing).
  const { data: parts } = await sb
    .from("parts")
    .select("slug, updated_at, category_slug, category, sales_type")
    .order("slug", { ascending: true })
    .limit(2000);

  const partItems = (parts ?? [])
    .filter((p) => p.slug)
    // Old charger-module product slugs 301-redirect to /charger-modules;
    // listing them here sends Google redirecting URLs.
    .filter((p) => !/-forklift-charger-module-/.test(p.slug))
    .map((p) => {
      // High-value categories get higher priority
      const isHighValue =
        p.category === "Lithium Batteries" ||
        p.category === "Charger Modules" ||
        p.sales_type === "direct";
      return {
        url: `${BASE}/parts/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: isHighValue ? 0.8 : 0.6,
      };
    });

  // ── 2. Charger product pages (legacy /chargers/ route) ───────────────────
  const { data: chargers } = await sb
    .from("parts")
    .select("slug, updated_at")
    .eq("category_slug", "battery-chargers")
    .order("slug", { ascending: true })
    .limit(2000);

  const chargerItems = (chargers ?? [])
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${BASE}/chargers/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // ── 3. Insight (blog) posts from MDX files ───────────────────────────────
  const insightSlugs = getAllInsightSlugs();
  const insightItems = insightSlugs.map(({ slug, mtime }) => ({
    url: `${BASE}/insights/${slug}`,
    lastModified: mtime,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ── 4. Lithium battery cart-model landing pages ──────────────────────────
  const cartLithiumItems = CART_MODELS.map((c) => ({
    url: `${BASE}/lithium-batteries/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: c.popularity === "High" ? 0.9 : c.popularity === "Medium" ? 0.8 : 0.7,
  }));

  // ── 4b. Dedicated charger-module part-number pages ───────────────────────
  const chargerModuleItems = CHARGER_MODULES.map((m) => ({
    url: `${BASE}/charger-modules/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // ── 5. Core marketing/landing pages ──────────────────────────────────────
  const corePages = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${BASE}/parts`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.95 },
    { url: `${BASE}/lithium-batteries`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.95 },
    { url: `${BASE}/charger-modules`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE}/battery-chargers`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE}/insights`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE}/safety`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE}/es/safety`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.85 },
    { url: `${BASE}/safety/forklift`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.85 },
    { url: `${BASE}/forklift-recertification-online`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE}/counterbalance-forklift-certification-online`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE}/osha-operator-training`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.75 },
    { url: `${BASE}/trainer`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.75 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  // ── 6. Forklift state-specific certification pages ───────────────────────
  // Only emit states whose pages are indexable; tier-3 states carry a noindex
  // robots meta, and listing them in the sitemap sends Google mixed signals.
  const statePages = forkliftStates
    .filter((state) => getStateMetrics(state.code).shouldIndex)
    .map((state) => ({
      url: `${BASE}/safety/forklift/${state.code}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [
    ...corePages,
    ...statePages,
    ...cartLithiumItems,
    ...chargerModuleItems,
    ...partItems,
    ...chargerItems,
    ...insightItems,
  ];
}
