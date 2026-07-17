/**
 * Static model → RT scissor parts hub deep-links for serial-lookup cross-links.
 * Models from TVH QRG SYPNRTQRG 2003034 (Genie / JLG / Skyjack rough-terrain scissors).
 */

export type RtScissorModelLink = {
  model: string;
  brandLabel: string;
  /** Featured joystick / control PDP when we have a clear Buy Now hero */
  heroSlug?: string;
};

export const RT_SCISSOR_MODEL_LINKS: Record<string, RtScissorModelLink[]> = {
  genie: [
    {
      model: 'GS68 RT',
      brandLabel: 'Genie',
      heroSlug: 'genie-78903-joystick-controller',
    },
    {
      model: 'GS84 RT',
      brandLabel: 'Genie',
      heroSlug: 'genie-78903-joystick-controller',
    },
    {
      model: 'GS90 RT',
      brandLabel: 'Genie',
      heroSlug: 'genie-78903-joystick-controller',
    },
  ],
  jlg: [
    {
      model: '260 MRT',
      brandLabel: 'JLG',
      heroSlug: 'jlg-1600290-joystick-controller',
    },
    {
      model: '400 RTS',
      brandLabel: 'JLG',
      heroSlug: 'jlg-1600290-joystick-controller',
    },
    {
      model: '500 RTS',
      brandLabel: 'JLG',
      heroSlug: 'jlg-1600290-joystick-controller',
    },
    {
      model: '3394 RT',
      brandLabel: 'JLG',
      heroSlug: 'jlg-1600403-joystick-controller',
    },
    {
      model: '4394 RT',
      brandLabel: 'JLG',
      heroSlug: 'jlg-1600403-joystick-controller',
    },
  ],
  skyjack: [
    {
      model: 'SJRT 6826',
      brandLabel: 'Skyjack',
      heroSlug: 'skyjack-123995-joystick-controller',
    },
    {
      model: 'SJRT 6832',
      brandLabel: 'Skyjack',
      heroSlug: 'skyjack-123995-joystick-controller',
    },
    {
      model: 'SJRT 7127',
      brandLabel: 'Skyjack',
      heroSlug: 'skyjack-132537-joystick-controller',
    },
    {
      model: 'SJRT 7135',
      brandLabel: 'Skyjack',
      heroSlug: 'skyjack-132537-joystick-controller',
    },
    { model: 'SJRT 8831', brandLabel: 'Skyjack' },
    { model: 'SJRT 8841', brandLabel: 'Skyjack' },
    {
      model: 'SJRT 9241',
      brandLabel: 'Skyjack',
      heroSlug: 'skyjack-132537-joystick-controller',
    },
    {
      model: 'SJRT 9250',
      brandLabel: 'Skyjack',
      heroSlug: 'skyjack-132537-joystick-controller',
    },
  ],
};

export function getRtScissorLinksForBrand(brand: string): RtScissorModelLink[] {
  const key = brand.trim().toLowerCase().replace(/\s+/g, ' ');
  if (key === 'genie') return RT_SCISSOR_MODEL_LINKS.genie;
  if (key === 'jlg') return RT_SCISSOR_MODEL_LINKS.jlg;
  if (key === 'skyjack') return RT_SCISSOR_MODEL_LINKS.skyjack;
  return [];
}

export function rtScissorHubHref(link: RtScissorModelLink): string {
  const params = new URLSearchParams({
    brand: link.brandLabel,
    model: link.model,
  });
  return `/rough-terrain-scissor-parts?${params.toString()}`;
}
