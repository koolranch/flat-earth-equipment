/**
 * Static model → cab-glass hub deep-links for serial-lookup cross-links.
 * Models chosen from published CPA glass intake (high-volume SSL/CTL / mini-ex).
 */

export type CabGlassModelLink = {
  /** Customer-facing machine model label */
  model: string;
  /** Brand label used by GlassFinder URL param */
  brandLabel: string;
  /** Optional primary door/front glass PDP when a clear hero SKU exists */
  doorSlug?: string;
};

export const CAB_GLASS_MODEL_LINKS: Record<string, CabGlassModelLink[]> = {
  bobcat: [
    {
      model: 'T650',
      brandLabel: 'Bobcat',
      doorSlug: 'bobcat-7120401-door-glass',
    },
    {
      model: 'T770',
      brandLabel: 'Bobcat',
      doorSlug: 'bobcat-7120401-door-glass',
    },
    {
      model: 'S650',
      brandLabel: 'Bobcat',
      doorSlug: 'bobcat-7120401-door-glass',
    },
    {
      model: 'T190',
      brandLabel: 'Bobcat',
      doorSlug: 'bobcat-6729776-door-glass',
    },
    {
      model: 'S185',
      brandLabel: 'Bobcat',
      doorSlug: 'bobcat-6729776-door-glass',
    },
    { model: 'E50', brandLabel: 'Bobcat' },
  ],
  caterpillar: [
    {
      model: '259D',
      brandLabel: 'Caterpillar',
      doorSlug: 'caterpillar-345-6230-door-glass',
    },
    {
      model: '262D',
      brandLabel: 'Caterpillar',
      doorSlug: 'caterpillar-345-6230-door-glass',
    },
    {
      model: '289D',
      brandLabel: 'Caterpillar',
      doorSlug: 'caterpillar-345-6230-door-glass',
    },
    { model: '305E2', brandLabel: 'Caterpillar' },
  ],
  kubota: [
    { model: 'KX018-4', brandLabel: 'Kubota' },
    { model: 'U55-4', brandLabel: 'Kubota' },
    {
      model: 'SVL75-2',
      brandLabel: 'Kubota',
      doorSlug: 'kubota-v0511-33150-rear-window',
    },
    { model: 'SVL90-2', brandLabel: 'Kubota' },
  ],
  takeuchi: [
    {
      model: 'TL250',
      brandLabel: 'Takeuchi',
      doorSlug: 'takeuchi-08808-65301-door-glass',
    },
    {
      model: 'TL10',
      brandLabel: 'Takeuchi',
      doorSlug: 'takeuchi-08808-65301-door-glass',
    },
    {
      model: 'TB230',
      brandLabel: 'Takeuchi',
      doorSlug: 'takeuchi-03586-00096-door-glass',
    },
    { model: 'TB260', brandLabel: 'Takeuchi' },
  ],
  case: [
    {
      model: 'SR175',
      brandLabel: 'Case',
      doorSlug: 'case-84344565-door-glass',
    },
    {
      model: 'SR160',
      brandLabel: 'Case',
      doorSlug: 'case-84344565-door-glass',
    },
    { model: 'CX80C', brandLabel: 'Case' },
    { model: 'TV450', brandLabel: 'Case' },
  ],
  'john deere': [
    {
      model: '333E',
      brandLabel: 'John Deere',
      doorSlug: 'john-deere-t312628-door-glass',
    },
    {
      model: '323E',
      brandLabel: 'John Deere',
      doorSlug: 'john-deere-t312628-door-glass',
    },
    { model: '35G', brandLabel: 'John Deere' },
    { model: '60G', brandLabel: 'John Deere' },
  ],
};

export function getCabGlassLinksForBrand(brand: string): CabGlassModelLink[] {
  return CAB_GLASS_MODEL_LINKS[brand.trim().toLowerCase()] ?? [];
}

export function cabGlassHubHref(link: CabGlassModelLink): string {
  const params = new URLSearchParams({
    brand: link.brandLabel,
    model: link.model,
  });
  return `/cab-glass?${params.toString()}`;
}
