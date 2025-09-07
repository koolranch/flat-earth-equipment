export function track(name: string, props?: Record<string, any>) { try { (window as any)?.analytics?.track?.(name, props); } catch {} }
