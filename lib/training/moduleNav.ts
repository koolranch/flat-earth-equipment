// Stub file for module navigation helpers
export function firstContentOrder(modules: any[]): number {
  return modules.find(m => m.content_slug)?.order || 1;
}

export function nextPlayableOrder(modules: any[], doneOrders: number[]): number | null {
  const nextModule = modules.find(m => !doneOrders.includes(m.order));
  return nextModule?.order || null;
}

export function hrefForOrder(order: number, courseSlug: string): string {
  return `/training/forklift-operator/module-${order}`;
}
