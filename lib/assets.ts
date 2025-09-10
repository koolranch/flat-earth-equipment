export function assetUrl(path: string) {
  const cleaned = path.replace(/^\/+/, '');
  const base = process.env.NEXT_PUBLIC_ASSET_BASE?.replace(/\/$/, '');
  if (base && /^https?:\/\//.test(base)) return `${base}/${cleaned}`;
  return `/${cleaned}`; // served from /public
}