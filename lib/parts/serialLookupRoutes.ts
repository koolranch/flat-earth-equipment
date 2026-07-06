/**
 * Canonical public serial-number lookup URLs by brand slug/name.
 * Keep in sync with components/brand/SerialLookupEmbed.tsx routes.
 */
const SERIAL_LOOKUP_ROUTES: Record<string, string> = {
  toyota: '/toyota-forklift-serial-lookup',
  hyster: '/hyster-serial-number-lookup',
  bobcat: '/bobcat-serial-number-lookup',
  crown: '/crown-serial-number-lookup',
  clark: '/clark-serial-number-lookup',
  cat: '/cat-serial-number-lookup',
  caterpillar: '/cat-serial-number-lookup',
  doosan: '/doosan-serial-number-lookup',
  jlg: '/jlg-serial-number-lookup',
  case: '/case-serial-number-lookup',
  kubota: '/kubota-serial-number-lookup',
  takeuchi: '/takeuchi-serial-number-lookup',
  jcb: '/jcb-serial-number-lookup',
  genie: '/genie-serial-number-lookup',
};

export function getSerialLookupPath(brand: string): string | null {
  const key = brand.trim().toLowerCase();
  return SERIAL_LOOKUP_ROUTES[key] ?? null;
}
