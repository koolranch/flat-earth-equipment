/**
 * Cart-page freight preview. Same dollars as the cart branch of
 * `app/api/checkout/route.ts`, including the default charge for lines
 * that match no existing rule.
 *
 * The category amounts below are the checkout bands. Keep them in step
 * with that route.
 */

import {
  cabGlassLinesCostDollars,
  cabGlassOrderFreightCents,
  isCabGlassCheckoutItem,
} from './cabGlassFreight';
import {
  defaultFreightForItems,
  isForkFreightCategory,
  isJcbFreightCategory,
  isMitsubishiFreightCategory,
  type FreightLine,
  type FreightReviewFlag,
} from './defaultFreight';
import { qualifiesForSeatFreeFreight } from './seatFreight';
import { skuFreightQuantity } from './skuFreight';

export type QuotedFreightLine = {
  name: string;
  cents: number;
};

export type QuotedFreight = {
  totalCents: number;
  freightFlag: FreightReviewFlag | null;
  lines: QuotedFreightLine[];
};

function freightEligible(item: FreightLine): boolean {
  if (item.metadata?.free_freight) return false;
  if (qualifiesForSeatFreeFreight(item.category, item.metadata)) return false;
  return true;
}

function jcbFreightCents(priceDollars: number): number {
  if (priceDollars < 25) return 1700;
  if (priceDollars < 150) return 2400;
  if (priceDollars < 300) return 2900;
  return 3500;
}

function mitsubishiFreightCents(priceDollars: number): number {
  if (priceDollars < 25) return 1800;
  if (priceDollars < 150) return 2500;
  if (priceDollars < 300) return 3100;
  if (priceDollars < 500) return 3700;
  if (priceDollars < 650) return 4100;
  return 5000;
}

function lithiumFreightCents(weightLbs: number): number {
  if (weightLbs < 50) return 9900;
  if (weightLbs < 100) return 14900;
  if (weightLbs < 150) return 19900;
  if (weightLbs < 200) return 27900;
  return 34900;
}

function pushFlat(
  lines: QuotedFreightLine[],
  categories: Array<string | null | undefined>,
  category: string,
  name: string,
  cents: number,
) {
  if (categories.includes(category)) lines.push({ name, cents });
}

export function quoteCheckoutFreight(items: FreightLine[]): QuotedFreight {
  const lines: QuotedFreightLine[] = [];
  const eligible = items.filter(freightEligible);

  for (const item of eligible) {
    const freightCents = Number(item.metadata?.freight_cents);
    if (!Number.isFinite(freightCents) || freightCents <= 0) continue;
    lines.push({
      name: 'Freight Shipping',
      cents: freightCents * skuFreightQuantity(item),
    });
  }

  const categoryItems = eligible.filter((item) => {
    const freightCents = Number(item.metadata?.freight_cents);
    return !(Number.isFinite(freightCents) && freightCents > 0);
  });
  const categories = categoryItems.map((item) => item.category).filter((category): category is string => Boolean(category));

  if (categories.some((category) => isForkFreightCategory(category))) {
    lines.push({
      name: 'Freight Shipping - Forklift Forks',
      cents: 39500,
    });
  }
  pushFlat(lines, categories, 'Rug / Carpet Rams', 'Freight Shipping - Carpet/Rug Rams', 100000);
  pushFlat(lines, categories, 'Mirrors', 'Freight Shipping - Equipment Mirrors', 1700);
  pushFlat(lines, categories, 'Brakes', 'Freight Shipping - Heavy Brake Components', 3500);
  pushFlat(lines, categories, 'Seat cushions', 'Freight Shipping - Seat Cushions', 2900);
  pushFlat(lines, categories, 'Seat covers', 'Freight Shipping - Seat Covers', 2900);
  pushFlat(lines, categories, 'Hydraulic Cylinders', 'Freight Shipping - Hydraulic Components', 2900);
  pushFlat(lines, categories, 'Undercarriage', 'Freight Shipping - Undercarriage Components', 2900);
  pushFlat(lines, categories, 'Seats', 'Freight Shipping - Equipment Seats', 2500);

  const cabGlassItems = categoryItems.filter((item) => isCabGlassCheckoutItem(item));
  if (cabGlassItems.length > 0) {
    const sellDollars = cabGlassItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Math.max(1, Number(item.quantity) || 1);
      return sum + price * qty;
    }, 0);
    const glassCents = cabGlassOrderFreightCents({
      sellDollars,
      costDollars: cabGlassLinesCostDollars(cabGlassItems),
    });
    if (glassCents > 0) {
      lines.push({ name: 'Freight Shipping - Cab Glass', cents: glassCents });
    }
  }

  pushFlat(lines, categories, 'Steering rod ends', 'Freight Shipping - Steering Components', 2500);

  const lithiumItems = items.filter((item) => item.category === 'Lithium Batteries');
  const lithiumQty = lithiumItems.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0);
  if (lithiumQty > 0 && lithiumQty < 3) {
    let total = 0;
    for (const item of lithiumItems) {
      const weight = Number(item.metadata?.weight_lbs ?? item.weight_lbs ?? 100);
      const qty = Math.max(1, Number(item.quantity) || 1);
      total += lithiumFreightCents(weight) * qty;
    }
    if (total > 0) {
      lines.push({ name: 'HazMat Freight Shipping - Lithium Batteries', cents: total });
    }
  }

  const mitsubishiItems = categoryItems.filter((item) => isMitsubishiFreightCategory(item.category));
  if (mitsubishiItems.length > 0) {
    let total = 0;
    for (const item of mitsubishiItems) {
      const price = Number(item.price) || 0;
      const qty = Math.max(1, Number(item.quantity) || 1);
      total += mitsubishiFreightCents(price) * qty;
    }
    if (total > 0) {
      lines.push({ name: 'Freight Shipping - Mitsubishi Parts', cents: total });
    }
  }

  const jcbItems = categoryItems.filter((item) => isJcbFreightCategory(item.category));
  if (jcbItems.length > 0) {
    let total = 0;
    for (const item of jcbItems) {
      const price = Number(item.price) || 0;
      const qty = Math.max(1, Number(item.quantity) || 1);
      total += jcbFreightCents(price) * qty;
    }
    if (total > 0) {
      lines.push({ name: 'Freight Shipping - JCB Parts', cents: total });
    }
  }

  const fallback = defaultFreightForItems(items);
  if (fallback.unitAmountCents > 0) {
    lines.push({ name: fallback.name, cents: fallback.unitAmountCents });
  }

  return {
    totalCents: lines.reduce((sum, line) => sum + line.cents, 0),
    freightFlag: fallback.freightFlag,
    lines,
  };
}
