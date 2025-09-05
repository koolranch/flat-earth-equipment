export function track(name: string, props?: Record<string, any>) {
  (window as any)?.analytics?.track?.(name, props || {});
}

export function trackDemo(event: string, moduleSlug: string, props?: Record<string, any>) {
  track(event, { module: moduleSlug, ...props });
}