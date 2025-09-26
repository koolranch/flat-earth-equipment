export function gameAssetUrl(key: string, file: string) {
  // Prefer explicit override. Example: https://<supabase-url>/storage/v1/object/public/games
  const base = process.env.NEXT_PUBLIC_GAME_ASSET_BASE
    || (process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/games` : null)
    || '/games'; // fallback to Next public/ folder
  // if base is absolute, use it; if it's "/games", serve from public/games/<key>/<file>
  return base.startsWith('http')
    ? `${base}/${key}/${file}`
    : `${base}/${key}/${file}`; // both branches return a proper absolute path
}

export function resolveGameAssets(key: string, files: string[]) {
  return files.map(f => gameAssetUrl(key, f));
}
