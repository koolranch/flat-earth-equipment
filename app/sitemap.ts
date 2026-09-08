import { MetadataRoute } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { forkliftStates } from "@/src/data/forkliftStates";
import { getStateMetrics } from "@/lib/safety/stateMetrics";
import { INDEXABLE_CHARGER_SERIES_SLUGS, isGreenVoltageAmpSlug } from "@/lib/chargers";
import { getChargerDetailHref } from "@/lib/batteryChargers";
import { CART_MODELS } from "@/constants/golfCartModels";
import { CHARGER_MODULES } from "@/constants/chargerOptions";
import * as fs from "fs";
import * as path from "path";

const BASE = "https://www.flatearthequipment.com";

/**
 * Read MDX blog post slugs from content/insights/ at build time.
 *
 * Only top-level files are included: `getBlogPost` in lib/mdx.ts resolves
 * `content/insights/{slug}.mdx` directly, so files in subdirectories
 * (rental/, chargers/, "forklift parts"/, …) are legacy imports that do NOT
 * render at /insights/{slug}. Listing them produced ~50 sitemap URLs that 404.
 */
function getAllInsightSlugs(): Array<{ slug: string; mtime: Date }> {
  const insightsDir = path.resolve(process.cwd(), "content/insights");
  const slugs: Array<{ slug: string; mtime: Date }> = [];

  try {
    const entries = fs.readdirSync(insightsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
      const slug = entry.name.replace(/\.mdx$/, "");
      const stat = fs.statSync(path.join(insightsDir, entry.name));
      slugs.push({ slug, mtime: stat.mtime });
    }
  } catch (e) {
    console.warn("Sitemap: failed to read content/insights:", e);
  }

  return slugs;
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
    // Old charger-module product slugs 301-redirect to /charger-modules/*;
    // listing them here sends Google redirecting URLs.
    .filter((p) => !/-forklift-charger-module-/.test(p.slug))
    .filter(
      (p) =>
        !(
          /^act-quantum-(36|48|80)vdc-(reman|repair)$/i.test(p.slug) ||
          p.category === "Charger Modules"
        )
    )
    // GREEN voltage×amp PDPs 301 to /chargers/* and stay noindex.
    .filter((p) => !isGreenVoltageAmpSlug(p.slug))
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

  const chargerItems = [
    ...INDEXABLE_CHARGER_SERIES_SLUGS.map((slug) => ({
      url: `${BASE}/chargers/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(chargers ?? [])
      .filter((p) => p.slug)
      .filter((p) => !isGreenVoltageAmpSlug(p.slug))
      .filter((p) => getChargerDetailHref(p.slug).startsWith("/chargers/"))
      .map((p) => ({
        url: `${BASE}/chargers/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];

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
    { url: `${BASE}/navitas-controllers`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
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
