export function toRouteIndex(order?: number, fallback = 0) {
  // DB order is 1-based, route index is 0-based
  if (typeof order === 'number' && !Number.isNaN(order)) return Math.max(0, order - 1);
  return Math.max(0, fallback);
}

export function nextRouteIndexFromCurrent(currentIndex: number, total: number) {
  const next = currentIndex + 1;
  return next < total ? next : currentIndex;
}
