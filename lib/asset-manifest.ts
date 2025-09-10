/* Lightweight keys -> file paths. If you have assets.config.json from the uploader, we read it; otherwise we fall back to sensible defaults in /public/training. */
// If your repo already has assets.config.json, enable JSON import below (and tsconfig resolveJsonModule=true)
// import manifestJson from '@/assets.config.json' assert { type: 'json' };
// type Manifest = Record<string, string>;
// const manifest: Manifest = (manifestJson as any) || {};
const manifest: Record<string,string> = {
  // PPE (C1)
  ppeVest: 'training/c1-ppe-vest.svg',
  ppeHardhat: 'training/c1-ppe-hardhat.svg',
  ppeBoots: 'training/c1-ppe-boots.svg',
  ppeGoggles: 'training/c1-ppe-goggles.svg',
  // Controls (C3)
  controlHorn: 'training/c3-control-horn.svg',
  controlLights: 'training/c3-control-lights.svg',
  // Inspection (C5)
  dataPlate: 'training/c5-plate.svg'
};
export function resolveAsset(key: string, fallbackPath?: string) {
  return manifest[key] || fallbackPath || key; // allow passing a direct path
}
