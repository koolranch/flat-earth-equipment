const SEAT_CATEGORIES = new Set(['Seats', 'Seat cushions', 'Seat covers']);
const SEAT_CATEGORY_SLUGS = new Set(['seats', 'seat-cushions', 'seat-covers']);

export type SeatVisualKind =
  | 'assembly'
  | 'cushion_back'
  | 'cushion_bottom'
  | 'cushion_set'
  | 'cushion_single'
  | 'cover';

export function isSeatCategory(
  category?: string | null,
  categorySlug?: string | null,
): boolean {
  if (category && SEAT_CATEGORIES.has(category)) return true;
  if (categorySlug && SEAT_CATEGORY_SLUGS.has(categorySlug)) return true;
  return false;
}

function kindFromName(name: string, category?: string | null): SeatVisualKind {
  const upper = name.toUpperCase();

  if (category === 'Seat covers' || upper.includes('SEAT COVER')) {
    return 'cover';
  }

  if (upper.includes('CUSHION SET') || upper.includes('CUSHION KIT')) {
    return 'cushion_set';
  }

  if (upper.includes('BACK CUSHION') || upper.includes('BACK SEAT')) {
    return 'cushion_back';
  }

  if (upper.includes('BOTTOM CUSHION') || upper.includes('SEAT BOTTOM')) {
    return 'cushion_bottom';
  }

  if (upper.includes('CUSHION')) {
    return 'cushion_single';
  }

  return 'assembly';
}

export function getSeatVisualKind(
  name: string,
  category?: string | null,
  metadata?: Record<string, unknown> | null,
): SeatVisualKind {
  const metaType = metadata?.product_type;
  if (
    metaType === 'assembly' ||
    metaType === 'cushion_back' ||
    metaType === 'cushion_bottom' ||
    metaType === 'cushion_set' ||
    metaType === 'cushion_single'
  ) {
    return metaType;
  }

  return kindFromName(name, category);
}

export function getSeatVisualLabel(kind: SeatVisualKind): string {
  switch (kind) {
    case 'assembly':
      return 'Seat assembly';
    case 'cushion_back':
      return 'Back cushion';
    case 'cushion_bottom':
      return 'Bottom cushion';
    case 'cushion_set':
      return 'Cushion set';
    case 'cushion_single':
      return 'Seat cushion';
    case 'cover':
      return 'Seat cover';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function formatDimensions(dimensions: Record<string, unknown>): string | null {
  const height = dimensions.h_in ?? dimensions.height_in;
  const width = dimensions.w_in ?? dimensions.width_in;
  const depth = dimensions.d_in ?? dimensions.length_in;

  const parts: string[] = [];
  if (typeof height === 'number') parts.push(`${height}"H`);
  if (typeof width === 'number') parts.push(`${width}"W`);
  if (typeof depth === 'number') parts.push(`${depth}"D`);

  return parts.length > 0 ? parts.join(' × ') : null;
}

export function getSeatVisualFacts(
  name: string,
  metadata?: Record<string, unknown> | null,
): {
  oemPn: string | null;
  material: string | null;
  dimensions: string | null;
  modelHint: string | null;
} {
  const oemPn =
    typeof metadata?.oem_pn === 'string'
      ? metadata.oem_pn
      : name.match(/\b([A-Z0-9][A-Z0-9.-]{4,})\b/i)?.[1]?.toUpperCase() ?? null;

  const material =
    typeof metadata?.material === 'string' && metadata.material.trim()
      ? metadata.material.trim()
      : null;

  const dimensions =
    metadata?.dimensions && typeof metadata.dimensions === 'object'
      ? formatDimensions(metadata.dimensions as Record<string, unknown>)
      : null;

  const modelMatch = name.match(
    /\b(?:for\s+)?([A-Z0-9][A-Z0-9./-]{1,})\s+(?:Seat|Cushion|Cover)\b/i,
  );
  const modelHint = modelMatch?.[1]?.trim() ?? null;

  return { oemPn, material, dimensions, modelHint };
}

export function shouldUseBrandLogoForCategory(category?: string | null): boolean {
  return !isSeatCategory(category);
}
