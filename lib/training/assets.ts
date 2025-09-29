// Stub file for training assets
export function getAssetUrl(path: string): string {
  return `/training/${path}`;
}

export function gameAssetUrl(path: string): string {
  return `/training/${path}`;
}

export function getModuleAssets(moduleNumber: number): string[] {
  return [
    `/training/svg/C${moduleNumber}_*.svg`,
    `/training/icons/icon-*.svg`,
  ];
}
