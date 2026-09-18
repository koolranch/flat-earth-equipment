/**
 * Hero-image candidate detection from a Magnasource itemdetail read.
 *
 * Magnasource sets `og:image` to the product hero at
 * `/services/getimage/{slug}-{magPartId}.jpg?key=…`. The filename embeds the part id with
 * separators stripped, which gives us an identity gate for the image just like the PN +
 * brand gate on the page text. This matters: the related-items carousel on the same page
 * shows other brands' parts, and a naive "first product image" pick lands on those.
 *
 * The `?key=` is a per-render signature, so the URL itself is never stored — only the
 * filename and the gate results. Bytes are fetched (later, in a separate step) at read time.
 *
 * Nothing here touches `parts.image_url`. A candidate is a fact about the vendor page, not
 * a decision about our catalog.
 */

export type HeroCandidate = {
  /** Basename of the og:image, query string removed. */
  filename: string;
  /** Filename contains the expected Magnasource part id. */
  identityOk: boolean;
  /** Filename suggests a stock "no image" graphic rather than a product photo. */
  placeholderSuspect: boolean;
};

/** Stored on `parts.metadata.mag_watch.hero` after each read. */
export type StoredHeroReading = {
  checked_at: string;
  filename: string | null;
  identity_ok: boolean;
  placeholder_suspect: boolean;
};

const PLACEHOLDER_HINTS = /no[-_]?image|placeholder|coming[-_]?soon|not[-_]?available|image[-_]?unavailable|default[-_]?product/i;

function alnum(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Basename with any query string or fragment removed. */
export function heroFilename(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const noQuery = trimmed.split(/[?#]/)[0];
  const base = noQuery.slice(noQuery.lastIndexOf('/') + 1);
  return base.length > 0 ? base : null;
}

export function heroCandidateFromOgImage(
  ogImage: string | null | undefined,
  magPartId: string
): HeroCandidate | null {
  if (typeof ogImage !== 'string') return null;
  const filename = heroFilename(ogImage);
  if (!filename) return null;

  const wanted = alnum(magPartId);
  const identityOk = wanted.length >= 4 && alnum(filename).includes(wanted);

  return {
    filename,
    identityOk,
    placeholderSuspect: PLACEHOLDER_HINTS.test(filename),
  };
}

export function toStoredHeroReading(
  candidate: HeroCandidate | null,
  checkedAt: string
): StoredHeroReading {
  return {
    checked_at: checkedAt,
    filename: candidate?.filename ?? null,
    identity_ok: candidate?.identityOk ?? false,
    placeholder_suspect: candidate?.placeholderSuspect ?? false,
  };
}

export type CurrentHeroKind = 'none' | 'placeholder' | 'brand_logo' | 'real';

/**
 * What kind of hero a catalog row has today. Brand logos and placeholders are not product
 * photography, so those rows are hero-blocked just like empty ones.
 */
export function currentHeroKind(imageUrl: string | null | undefined): CurrentHeroKind {
  if (!imageUrl || imageUrl.trim() === '') return 'none';
  const lower = imageUrl.toLowerCase();
  if (lower.includes('placeholder')) return 'placeholder';
  if (lower.includes('brand-logos') || lower.includes('/logos/') || /\blogo\b|logo\./.test(lower)) {
    return 'brand_logo';
  }
  return 'real';
}

/** Exact catalog shelves: Seats / Seat cushions / Seat covers. */
export function isSeatCategory(category: string | null | undefined): boolean {
  if (!category) return false;
  return /^seat(s| cushions| covers)?$/i.test(category.trim());
}

/**
 * Broader seat-family gate for the image tray. Brand-prefixed shelves (`JCB Seats`)
 * and names that are the seat itself never take a vendor-derived hero.
 */
export function isSeatFamily(
  category: string | null | undefined,
  name?: string | null,
  filename?: string | null
): boolean {
  if (isSeatCategory(category)) return true;
  if (category && /seat/i.test(category)) return true;
  if (name && /\bseats?\b/i.test(name)) return true;
  if (filename && /seat/i.test(filename)) return true;
  return false;
}
