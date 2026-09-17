/**
 * Parse a Magnasource itemdetail page (scraped markdown) into an inventory + sticker
 * snapshot.
 *
 * Magnasource runs on the same supplier API as our TVH-sourced equipment parts, so its
 * on-hand count is a vendor stock reference and its public price is the sticker we
 * benchmark against. Neither is our own stock flag: `parts.is_in_stock` stays ours, and
 * Mag "limited / 1 on hand" has been wrong low before (JCB 333/H8243 read 1 while the
 * vendor held 24).
 *
 * Safety contract:
 *   - Both identity gates (part number + brand) must pass before any number is trusted.
 *   - An unparseable page yields `unknown`, never a sold-out verdict. Only an
 *     affirmative zero / backorder / special-order reading may take a SKU off Buy Now.
 *   - HTTP 200 is not proof of existence: a bad item id returns 200 with
 *     "Sorry, the requested item is no longer valid".
 */

export type MagAvailability =
  | 'in_stock'
  | 'limited'
  | 'backorder'
  | 'special_order'
  | 'contact_for_price'
  | 'invalid_pn'
  | 'unknown';

export type MagSnapshot = {
  availability: MagAvailability;
  /** Public sticker at qty 1. Null when the page hides price. */
  price: number | null;
  /** Struck-through list price when the page shows a Save $X (Y%) line. */
  listPrice: number | null;
  qtyOnHand: number | null;
  /** True when the page caps the count, e.g. "100+ in stock". */
  qtyIsFloor: boolean;
  weightLb: number | null;
  sellingUnit: string | null;
  /** Magnasource's own "confirmed by supplier at" stamp — our freshness proof. */
  supplierConfirmedAt: string | null;
  /**
   * Backorder arrival window when the page gives one. A part due in three weeks reads
   * differently from "Estimated delivery not available" — both are off Buy Now, but the
   * first is worth relisting sooner.
   */
  backorderEta: string | null;
  /** Part number echoed by the page, e.g. JC333/D1629. */
  pagePartNumber: string | null;
  /** Brand echoed by the page, e.g. Jcb. */
  pageBrand: string | null;
  /** Item title echoed by the page. */
  pageTitle: string | null;
  identityOk: boolean;
  notes: string[];
};

/** Availability readings that mean "do not sell this on Buy Now". */
const SOLD_OUT: ReadonlySet<MagAvailability> = new Set<MagAvailability>([
  'backorder',
  'special_order',
]);

export function isSoldOutReading(availability: MagAvailability): boolean {
  return SOLD_OUT.has(availability);
}

/** Readings that must never drive an automated write. */
export function isActionableReading(availability: MagAvailability): boolean {
  switch (availability) {
    case 'in_stock':
    case 'limited':
    case 'backorder':
    case 'special_order':
      return true;
    case 'contact_for_price':
    case 'invalid_pn':
    case 'unknown':
      return false;
    default: {
      const exhaustive: never = availability;
      return exhaustive;
    }
  }
}

const INVALID_ITEM_RE = /(no longer valid|requested item is no longer)/i;
const SPECIAL_ORDER_RE = /(special\s*order|supplier\s*special|non-?cancell?able|non-?returnable|made\s*to\s*order)/i;
const BACKORDER_RE = /(back\s*-?\s*order(ed)?|on\s*backorder|out\s*of\s*stock|currently\s*unavailable)/i;
const CONTACT_PRICE_RE = /(call\s*for\s*price|contact\s*(us\s*)?for\s*pric|price\s*on\s*request)/i;

function toNumber(raw?: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * Magnasource renders the hero price split across lines ("$340" then ".83") but also
 * prints a clean single-line "TOTAL PRICE $340.83" at qty 1. Prefer the clean one.
 */
function parsePrice(markdown: string): number | null {
  const total = markdown.match(/TOTAL\s*PRICE\s*\n+\s*\$([\d,]+\.\d{2})/i);
  const fromTotal = toNumber(total?.[1]);
  if (fromTotal !== null) return fromTotal;

  const split = markdown.match(/\$([\d,]+)\s*\n+\s*\.(\d{2})\b/);
  if (split) {
    const dollars = split[1].replace(/,/g, '');
    return toNumber(`${dollars}.${split[2]}`);
  }

  const inline = markdown.match(/\$([\d,]+\.\d{2})/);
  return toNumber(inline?.[1]);
}

function parseListPrice(markdown: string, price: number | null): number | null {
  // "$675.02\n\nSave $334.19 (50%)" — derive list from the savings line so we never
  // mistake a related-item price for the strikethrough.
  const save = markdown.match(/Save\s*\$([\d,]+\.\d{2})\s*\(\d+%\)/i);
  const saved = toNumber(save?.[1]);
  if (saved === null || price === null) return null;
  const list = Math.round((price + saved) * 100) / 100;
  return list > price ? list : null;
}

function parseQty(markdown: string): { qty: number | null; isFloor: boolean } {
  const match = markdown.match(
    /(\d[\d,]*)(\+)?\s+(?:on hand|in stock)\b/i
  );
  if (match) {
    return { qty: toNumber(match[1]), isFloor: Boolean(match[2]) };
  }
  if (/\b(no|0)\s+(?:on hand|in stock)\b/i.test(markdown)) {
    return { qty: 0, isFloor: false };
  }
  return { qty: null, isFloor: false };
}

export function parseMagSnapshot(
  markdown: string,
  expected: { magPartId: string; brand: string }
): MagSnapshot {
  const notes: string[] = [];
  const base: MagSnapshot = {
    availability: 'unknown',
    price: null,
    listPrice: null,
    qtyOnHand: null,
    qtyIsFloor: false,
    weightLb: null,
    sellingUnit: null,
    supplierConfirmedAt: null,
    backorderEta: null,
    pagePartNumber: null,
    pageBrand: null,
    pageTitle: null,
    identityOk: false,
    notes,
  };

  if (!markdown.trim()) {
    notes.push('empty_response');
    return base;
  }

  if (INVALID_ITEM_RE.test(markdown)) {
    notes.push('page_reports_item_not_valid');
    return { ...base, availability: 'invalid_pn' };
  }

  const pnMatch = markdown.match(/###\s*Part Number:\s*([^\n]+)/i);
  const pageTitleMatch = markdown.match(/^#\s+(.+)$/m);
  const brandLineMatch = markdown.match(/^##\s*(.+?)\s+for\s+(.+?)\s*$/m);

  const pagePartNumber = pnMatch?.[1]?.trim() ?? null;
  const pageBrand = brandLineMatch?.[2]?.trim() ?? null;
  const pageTitle = pageTitleMatch?.[1]?.trim() ?? null;

  const pnOk =
    pagePartNumber !== null &&
    pagePartNumber.replace(/\s+/g, '').toUpperCase() ===
      expected.magPartId.replace(/\s+/g, '').toUpperCase();
  const brandOk =
    pageBrand !== null && pageBrand.toLowerCase() === expected.brand.toLowerCase();

  if (!pnOk) notes.push(`part_number_mismatch:${pagePartNumber ?? 'none'}`);
  if (!brandOk) notes.push(`brand_mismatch:${pageBrand ?? 'none'}`);

  const identityOk = pnOk && brandOk;

  const price = parsePrice(markdown);
  const listPrice = parseListPrice(markdown, price);
  const { qty, isFloor } = parseQty(markdown);
  const weightLb = toNumber(markdown.match(/Weight:\s*\n+\s*([\d.]+)\s*lbs/i)?.[1]);
  const sellingUnit = markdown.match(/Selling Unit:\s*\n+\s*(\S+)/i)?.[1] ?? null;
  const supplierConfirmedAt =
    markdown.match(/Inventory availability confirmed by supplier at\s*([^\n]+)/i)?.[1]?.trim() ??
    null;

  // "**1** Backordered items. Estimated to arrive between Friday, October 9 and ..." — the
  // number there is the quantity on order, never an on-hand count.
  const etaWindow = markdown.match(
    /Estimated to arrive between\s*\*{0,2}([^*\n]+?)\*{0,2}\s*and\s*\*{0,2}([^*\n.]+?)\*{0,2}\s*(?:on average)?\.?\s*$/im
  );
  const etaNone = /Estimated delivery not available/i.test(markdown);
  const backorderEta = etaWindow
    ? `${etaWindow[1].trim()} – ${etaWindow[2].trim()}`
    : etaNone
      ? 'not available'
      : null;

  const partial: MagSnapshot = {
    ...base,
    price,
    listPrice,
    qtyOnHand: qty,
    qtyIsFloor: isFloor,
    weightLb,
    sellingUnit,
    supplierConfirmedAt,
    backorderEta,
    pagePartNumber,
    pageBrand,
    pageTitle,
    identityOk,
  };

  // Identity failure means we may be reading a different part. Report nothing actionable.
  if (!identityOk) return partial;

  // Only inspect the item block for stock language; related items carry their own copy.
  const itemBlock = markdown.split(/Related Items/i)[0] ?? markdown;

  // A positive on-hand count outranks policy wording. Return/cancellation boilerplate
  // must never be read as sold out on a SKU the supplier is holding stock for.
  let availability: MagAvailability = 'unknown';
  if (qty !== null && qty > 0) {
    const limited = /Limited Availability/i.test(itemBlock) || qty <= 2;
    availability = limited ? 'limited' : 'in_stock';
    if (limited) notes.push(`limited_on_hand:${qty}`);
  } else if (qty === 0) {
    availability = SPECIAL_ORDER_RE.test(itemBlock) ? 'special_order' : 'backorder';
    notes.push('zero_on_hand');
  } else if (SPECIAL_ORDER_RE.test(itemBlock)) {
    availability = 'special_order';
    notes.push('page_reports_special_order');
  } else if (BACKORDER_RE.test(itemBlock)) {
    availability = 'backorder';
    notes.push('page_reports_backorder');
  } else if (price === null && CONTACT_PRICE_RE.test(itemBlock)) {
    availability = 'contact_for_price';
    notes.push('page_hides_price');
  } else {
    notes.push('availability_unparsed');
  }

  if (price === null && availability !== 'contact_for_price') {
    notes.push('price_unparsed');
  }

  return { ...partial, availability };
}

/** Sticker drift vs our current sell price, expressed against the target discount. */
export function stickerDrift(params: {
  ourSell: number;
  magPrice: number;
  targetDiscount: number;
}): {
  /** Our sell as a discount off Mag. Negative means we are priced above Mag. */
  actualDiscount: number;
  /** Percentage points away from the target discount. */
  driftPoints: number;
  aboveMag: boolean;
} {
  const actualDiscount = (params.magPrice - params.ourSell) / params.magPrice;
  return {
    actualDiscount,
    driftPoints: Math.round((actualDiscount - params.targetDiscount) * 1000) / 10,
    aboveMag: params.ourSell > params.magPrice,
  };
}
