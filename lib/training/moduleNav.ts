export type UIModule = { id: string; order: number; title: string; content_slug: string | null };

export function firstContentOrder(mods: UIModule[]): number | null {
  const withSlug = mods.filter(m => !!m.content_slug).sort((a,b)=>a.order-b.order);
  return withSlug.length ? withSlug[0].order : null;
}

export function lastCompletedOrder(doneOrders: number[]): number | null {
  if (!doneOrders?.length) return null;
  return Math.max(...doneOrders);
}

export function nextPlayableOrder(mods: UIModule[], doneOrders: number[]): number | null {
  const sorted = [...mods].sort((a,b)=>a.order-b.order);
  for (const m of sorted) {
    if (!doneOrders.includes(m.order)) return m.order;
  }
  return null;
}

export function hrefForOrder(order: number, courseSlug: string) {
  return `/training/module/${order}?courseId=${encodeURIComponent(courseSlug)}`;
}
