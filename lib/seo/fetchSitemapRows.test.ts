import assert from "node:assert/strict";
import { fetchAllSitemapRows, SITEMAP_PAGE_SIZE } from "./fetchSitemapRows";

async function walkThreePages() {
  const pages = [
    Array.from({ length: SITEMAP_PAGE_SIZE }, (_, i) => i),
    Array.from({ length: SITEMAP_PAGE_SIZE }, (_, i) => i + SITEMAP_PAGE_SIZE),
    [2000, 2001, 2002],
  ];
  const seen: Array<[number, number]> = [];
  const rows = await fetchAllSitemapRows<number>(async (from, to) => {
    seen.push([from, to]);
    const page = pages[from / SITEMAP_PAGE_SIZE] ?? [];
    return { data: page, error: null };
  });
  assert.deepEqual(seen, [
    [0, 999],
    [1000, 1999],
    [2000, 2999],
  ]);
  assert.equal(rows.length, 2003);
  assert.equal(rows[0], 0);
  assert.equal(rows[2002], 2002);
}

async function emptyFirstPage() {
  const rows = await fetchAllSitemapRows(async () => ({ data: [], error: null }));
  assert.deepEqual(rows, []);
}

async function stopOnError() {
  const rows = await fetchAllSitemapRows(async (from) => {
    if (from === 0) {
      return { data: Array.from({ length: SITEMAP_PAGE_SIZE }, (_, i) => i), error: null };
    }
    return { data: null, error: { message: "boom" } };
  });
  assert.equal(rows.length, SITEMAP_PAGE_SIZE);
}

await walkThreePages();
await emptyFirstPage();
await stopOnError();
console.log("fetchSitemapRows.test.ts passed");
