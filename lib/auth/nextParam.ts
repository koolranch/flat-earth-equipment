export function safeNext(input: string | null | undefined, fallback = '/training') {
  if (!input) return fallback;
  try {
    // Only allow same-origin paths
    const u = new URL(input, 'http://local');
    if (u.origin !== 'http://local') return fallback;
    if (!u.pathname.startsWith('/')) return fallback;
    // Disallow auth loops
    if (u.pathname.startsWith('/login') || u.pathname.startsWith('/auth')) return fallback;
    return u.pathname + (u.search || '') + (u.hash || '');
  } catch {
    return fallback;
  }
}
