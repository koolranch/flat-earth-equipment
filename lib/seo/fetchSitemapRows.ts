/** Supabase default max-rows is 1000; never use a single .limit() for sitemaps. */
export const SITEMAP_PAGE_SIZE = 1000;

export type SitemapQueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

/**
 * Walk a Supabase select in pages until a short page. Same URL set as a
 * complete table scan — no slug cutoff.
 */
export async function fetchAllSitemapRows<T>(
  loadPage: (from: number, to: number) => Promise<SitemapQueryResult<T>>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += SITEMAP_PAGE_SIZE) {
    const { data, error } = await loadPage(from, from + SITEMAP_PAGE_SIZE - 1);
    if (error) {
      console.warn("Sitemap: parts page failed:", error.message);
      break;
    }
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < SITEMAP_PAGE_SIZE) break;
  }
  return rows;
}
