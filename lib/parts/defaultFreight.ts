/**
 * Ground freight for a checkout line that matches no existing rule.
 *
 * Existing rules stay where they are (free_freight, seat cost ≥ $650,
 * metadata.freight_cents, the category flat rates, cab glass, lithium,
 * Mitsubishi*, JCB*). This module only prices the leftover lines.
 *
 * One charge per order, from the sum of estimated cost on those lines.
 * Estimated cost is metadata.cost_wholesale when it is > 0, otherwise
 * sell price × 0.80, times quantity.
 *
 * Free only when every no-rule line has a real cost_wholesale and that
 * total is ≥ $650, or the no-rule sell total is ≥ $1,000.
 * Heavy lines and the excluded types below never go free.
 */

import { isCabGlassCheckoutItem } from './cabGlassFreight';
import { catalogWeightLbs } from './checkoutFreight';
import { qualifiesForSeatFreeFreight } from './seatFreight';

export const FORK_FREIGHT_CATEGORIES = [
  'forks',
  'Class II Forks',
  'Class III Forks',
  'Class IV Forks',
] as const;

/** Category strings that already add a flat freight line in checkout. */
export const FLAT_FREIGHT_CATEGORIES = [
  ...FORK_FREIGHT_CATEGORIES,
  'Rug / Carpet Rams',
  'Mirrors',
  'Brakes',
  'Seat cushions',
  'Seat covers',
  'Hydraulic Cylinders',
  'Undercarriage',
  'Seats',
  'Steering rod ends',
] as const;

const FLAT_FREIGHT_CATEGORY_SET = new Set<string>(FLAT_FREIGHT_CATEGORIES);

export const DEFAULT_FREIGHT_NAME = 'Freight Shipping';
export const DEFAULT_FREIGHT_DESCRIPTION = 'Ground shipping for equipment parts';
export const LTL_FREIGHT_NAME = 'Freight Shipping - LTL';
export const LTL_FREIGHT_DESCRIPTION = 'LTL freight for equipment parts';

const LTL_LINE_LBS = 75;
const LTL_ORDER_LBS = 300;
const LTL_CENTS = 25000;
const FREE_COST_CENTS = 65000;
const FREE_SELL_CENTS = 100000;
const EXCLUDED_SELL_FLAG_CENTS = 65000;
const EXCLUDED_INSTEAD_OF_FREE_CENTS = 4300;

export type FreightReviewFlag = 'ltl' | 'excluded_over_650';

export type FreightLine = {
  name?: string | null;
  category?: string | null;
  price?: number | string | null;
  quantity?: number | null;
  weight_lbs?: number | null;
  isTraining?: boolean;
  metadata?: Record<string, unknown> | null;
};

export type DefaultFreightDecision = {
  unitAmountCents: number;
  name: string;
  description: string;
  freightFlag: FreightReviewFlag | null;
};

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function positiveDollars(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

function quantityOf(item: FreightLine): number {
  const n = Number(item.quantity);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function isForkFreightCategory(category: string | null | undefined): boolean {
  return typeof category === 'string' && (FORK_FREIGHT_CATEGORIES as readonly string[]).includes(category);
}

export function isFlatFreightCategory(category: string | null | undefined): boolean {
  return typeof category === 'string' && FLAT_FREIGHT_CATEGORY_SET.has(category);
}

export function isJcbFreightCategory(category: string | null | undefined): boolean {
  return category === 'JCB Parts' || (typeof category === 'string' && category.startsWith('JCB '));
}

export function isMitsubishiFreightCategory(category: string | null | undefined): boolean {
  return (
    category === 'Mitsubishi Parts' ||
    (typeof category === 'string' && category.startsWith('Mitsubishi '))
  );
}

/** True when checkout already prices this line, so the default must not. */
export function hasExistingFreightRule(item: FreightLine): boolean {
  if (item.isTraining) return true;
  if (item.metadata?.free_freight) return true;
  if (qualifiesForSeatFreeFreight(item.category, item.metadata)) return true;
  const freightCents = Number(item.metadata?.freight_cents);
  if (Number.isFinite(freightCents) && freightCents > 0) return true;
  if (isFlatFreightCategory(item.category)) return true;
  if (isCabGlassCheckoutItem(item)) return true;
  if (item.category === 'Lithium Batteries') return true;
  if (isMitsubishiFreightCategory(item.category)) return true;
  if (isJcbFreightCategory(item.category)) return true;
  return false;
}

function categorySlug(item: FreightLine): string {
  return text(item.metadata?.category_slug);
}

/** Charger modules stay free. Battery chargers still use the default band. */
export function isChargerModuleFreightFree(item: FreightLine): boolean {
  if (text(item.category) === 'Charger Modules' || categorySlug(item) === 'charger-modules') return true;
  return /\bcharger modules?\b/i.test(text(item.name));
}

/**
 * Lumber forks have no weight on file, and Genie 53.0300.2201GT is 74.96 lb.
 * Both ship LTL at the $250 rate instead of the $1,000 free rule.
 */
export function forcesRecommendedLtl(item: FreightLine): boolean {
  if (text(item.category) === 'Lumber Forks' || categorySlug(item) === 'lumber-forks') return true;
  const blob = `${text(item.name)} ${text(item.metadata?.sku)} ${text(item.metadata?.slug)}`;
  return /53\.0300\.2201/i.test(blob);
}

/**
 * Types that stay on the paid band even when the order would otherwise ship free.
 * Matched on category, category slug, and the product name. A turbocharger is
 * not a battery charger. An oil filter or switch is not an engine.
 */
export function isExcludedFreightType(item: FreightLine): boolean {
  if (isChargerModuleFreightFree(item)) return false;
  const category = text(item.category);
  const slug = categorySlug(item);
  const name = text(item.name);
  const haystack = `${category} ${slug}`;

  if (/\bchargers?\b/i.test(haystack)) return true;
  if (/\b(tires?|wheels?)\b/i.test(haystack)) return true;
  if (/\bengines?\b/i.test(haystack)) return true;
  if (/\btransmissions?\b/i.test(haystack)) return true;
  if (/\battachments?\b/i.test(haystack)) return true;
  if (/\bpallet trucks?\b/i.test(haystack)) return true;
  if (/\bside[\s-]?shifts?\b/i.test(haystack)) return true;
  if (/\barrow boards?\b/i.test(haystack)) return true;
  if (/\bdrop[\s-]?ship/i.test(haystack)) return true;

  if (item.metadata?.drop_ship === true || item.metadata?.drop_ship === 'true') return true;
  const fulfillment = text(item.metadata?.fulfillment).toLowerCase();
  if (fulfillment === 'drop_ship' || fulfillment === 'drop-ship' || fulfillment === 'dropship') {
    return true;
  }

  if (!name) return false;
  if (/\bchargers?\b/i.test(name) && !/\bturbo[\s-]*chargers?\b/i.test(name)) return true;
  if (/\btires?\b/i.test(name)) return true;
  if (/\b(drive|load|caster|mould-on|moulded|poly)\s+wheels?\b/i.test(name)) return true;
  if (/\bengines?\b/i.test(name) && !/\b(filter|switch|mount|sensor|harness|oil|kit)\b/i.test(name)) {
    return true;
  }
  if (/\btransmissions?\b/i.test(name) && !/\bmount\b/i.test(name)) return true;
  if (/\battachments?\b/i.test(name)) return true;
  if (/\bpallet trucks?\b/i.test(name)) return true;
  if (/\blp(?:\s|-)?(?:gas\s+)?tanks?\b/i.test(name) || /\bpropane tanks?\b/i.test(name)) return true;
  if (/\bside[\s-]?shifts?\b/i.test(name)) return true;
  if (/\barrow boards?\b/i.test(name)) return true;
  if (/\bdrop[\s-]?ship/i.test(name)) return true;
  return false;
}

export function lineWeightLbs(item: FreightLine): number | null {
  return catalogWeightLbs(item.weight_lbs, item.metadata);
}

/** cost_wholesale when it is a positive number. Estimated cost uses sell × 0.80 otherwise. */
export function lineCostDollars(item: FreightLine): number | null {
  return positiveDollars(item.metadata?.cost_wholesale);
}

export function lineSellDollars(item: FreightLine): number {
  return positiveDollars(item.price) ?? 0;
}

/** Per-line estimated cost in cents, already multiplied by quantity. */
export function lineEstimatedCostCents(item: FreightLine): number {
  const qty = quantityOf(item);
  const cost = lineCostDollars(item);
  const unitCents =
    cost != null ? dollarsToCents(cost) : Math.round(dollarsToCents(lineSellDollars(item)) * 0.8);
  return unitCents * qty;
}

function bandCents(estimatedCents: number): number {
  if (estimatedCents < 2500) return 2000;
  if (estimatedCents < 15000) return 2700;
  if (estimatedCents < 30000) return 3300;
  if (estimatedCents < 50000) return 3900;
  return 4300;
}

function noCharge(): DefaultFreightDecision {
  return {
    unitAmountCents: 0,
    name: DEFAULT_FREIGHT_NAME,
    description: DEFAULT_FREIGHT_DESCRIPTION,
    freightFlag: null,
  };
}

export function defaultFreightForItems(items: FreightLine[]): DefaultFreightDecision {
  const lines = items.filter((item) => !hasExistingFreightRule(item) && !isChargerModuleFreightFree(item));
  if (lines.length === 0) return noCharge();

  let estimatedCents = 0;
  let sellCents = 0;
  let verifiedCostCents = 0;
  let verified = true;
  let totalWeight = 0;
  let anyHeavy = false;
  let excluded = false;

  for (const line of lines) {
    const qty = quantityOf(line);
    estimatedCents += lineEstimatedCostCents(line);
    sellCents += dollarsToCents(lineSellDollars(line)) * qty;
    const cost = lineCostDollars(line);
    if (cost == null) {
      verified = false;
    } else {
      verifiedCostCents += dollarsToCents(cost) * qty;
    }
    const weight = lineWeightLbs(line);
    if (weight != null) {
      totalWeight += weight * qty;
      if (weight >= LTL_LINE_LBS) anyHeavy = true;
    }
    if (forcesRecommendedLtl(line)) anyHeavy = true;
    if (isExcludedFreightType(line)) excluded = true;
  }

  if (anyHeavy || totalWeight > LTL_ORDER_LBS) {
    return {
      unitAmountCents: LTL_CENTS,
      name: LTL_FREIGHT_NAME,
      description: LTL_FREIGHT_DESCRIPTION,
      freightFlag: 'ltl',
    };
  }

  const costVerified = verified && verifiedCostCents >= FREE_COST_CENTS;
  const wouldBeFree = costVerified || sellCents >= FREE_SELL_CENTS;
  const excludedOver650 =
    excluded &&
    (wouldBeFree || sellCents >= EXCLUDED_SELL_FLAG_CENTS || (verified && verifiedCostCents >= FREE_COST_CENTS));

  if (wouldBeFree && excluded) {
    return {
      unitAmountCents: EXCLUDED_INSTEAD_OF_FREE_CENTS,
      name: DEFAULT_FREIGHT_NAME,
      description: DEFAULT_FREIGHT_DESCRIPTION,
      freightFlag: 'excluded_over_650',
    };
  }

  if (wouldBeFree) return noCharge();

  return {
    unitAmountCents: bandCents(estimatedCents),
    name: DEFAULT_FREIGHT_NAME,
    description: DEFAULT_FREIGHT_DESCRIPTION,
    freightFlag: excludedOver650 ? 'excluded_over_650' : null,
  };
}

/**
 * Buy Now `{priceId, slug, qty}` path. Rule categories stay at $0 here.
 * An unclassified row (catalog lookup missed) is also left alone.
 */
export function defaultFreightForSimpleItem(item: FreightLine): DefaultFreightDecision {
  if (!text(item.category) && !categorySlug(item)) return noCharge();
  return defaultFreightForItems([item]);
}
