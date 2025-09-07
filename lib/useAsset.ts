import { ASSETS, type AssetKey } from './assets';

export function useAsset(key: AssetKey, opts?: { sprite?: boolean }) {
  const href = ASSETS[key];
  const isSprite = opts?.sprite ?? href.includes('#');
  if (isSprite) {
    const [file, frag] = href.split('#');
    return { file, frag: `#${frag}`, href };
  }
  return { file: href, frag: null as unknown as string, href };
}
