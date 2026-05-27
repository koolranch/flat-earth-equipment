/**
 * Sell-price calculator calibrated from batch-1 seat examples:
 *
 * | SKU          | Cost    | Comp     | Target sell | vs comp |
 * | CT298-8722   | $694.33 | $949.43  | $899        | ~5%     |
 * | GN123137     | $117.30 | $209.68  | $199        | ~5%     |
 * | JL91563158   | $777.65 | $988.78  | $979        | ~1%     |
 *
 * Rule: default 5% below lowest trusted comp, but never below margin floor.
 * High-ticket assemblies (comp ≥ $900) may sit closer to market when floor allows.
 */

export type PricingCategory = 'assembly' | 'cushion';

export type SellPriceResult = {
  sellPrice: number;
  method: 'comp_discount' | 'margin_floor' | 'cost_multiplier';
  compDiscountUsed?: number;
  marginPct: number;
  notes: string[];
};

/** Default comp discount (matches JCB Magnasource workflow). */
export const DEFAULT_COMP_DISCOUNT = 0.05;

const MIN_MARGIN: Record<PricingCategory, number> = {
  assembly: 0.2,
  cushion: 0.35,
};

const COST_MULTIPLIER_NO_COMP: Record<PricingCategory, number> = {
  assembly: 1.25,
  cushion: 1.35,
};

function roundSell(price: number, category: PricingCategory): number {
  if (category === 'assembly' && price >= 300) {
    return Math.round(price / 10) * 10 - 1;
  }
  return Math.round(price);
}

function marginPct(cost: number, sell: number): number {
  return sell > 0 ? (sell - cost) / sell : 0;
}

export function categoryFromPartCategory(category?: string | null): PricingCategory {
  if (category === 'Seat cushions') return 'cushion';
  return 'assembly';
}

export function calculateSellPrice(params: {
  cost?: number | null;
  compPrice?: number | null;
  category?: PricingCategory;
  /** Override comp discount (0.05 = 5% below comp) */
  compDiscount?: number;
}): SellPriceResult {
  const category = params.category ?? 'assembly';
  const notes: string[] = [];
  const minMargin = MIN_MARGIN[category];
  const cost = typeof params.cost === 'number' && params.cost > 0 ? params.cost : null;
  const hasCost = cost !== null;

  if (!params.compPrice || params.compPrice <= 0) {
    if (!hasCost) {
      throw new Error('Need compPrice or cost to calculate sell price');
    }
    const sell = roundSell(cost * COST_MULTIPLIER_NO_COMP[category], category);
    return {
      sellPrice: sell,
      method: 'cost_multiplier',
      marginPct: marginPct(cost, sell),
      notes: [`No comp — cost × ${COST_MULTIPLIER_NO_COMP[category]}`],
    };
  }

  const discount = params.compDiscount ?? DEFAULT_COMP_DISCOUNT;
  const compBased = params.compPrice * (1 - discount);

  if (!hasCost) {
    const sell = roundSell(compBased, category);
    if (category === 'assembly' && params.compPrice >= 900 && sell >= params.compPrice) {
      notes.push('Capped just below comp for high-ticket assembly');
      return {
        sellPrice: Math.floor(params.compPrice) - 1,
        method: 'comp_discount',
        compDiscountUsed: discount,
        marginPct: 0,
        notes: [...notes, 'Provisional — no wholesale cost on file'],
      };
    }
    return {
      sellPrice: sell,
      method: 'comp_discount',
      compDiscountUsed: discount,
      marginPct: 0,
      notes: ['Provisional — no wholesale cost on file'],
    };
  }

  const floorBased = cost / (1 - minMargin);
  let sell = Math.max(compBased, floorBased);
  let method: SellPriceResult['method'] = compBased >= floorBased ? 'comp_discount' : 'margin_floor';

  if (method === 'margin_floor') {
    notes.push(
      `Margin floor ${(minMargin * 100).toFixed(0)}% pushed price above comp−${(discount * 100).toFixed(0)}%`
    );
  }

  sell = roundSell(sell, category);

  // High-ticket: if rounded sell overshoots comp, pull back to just under comp
  if (category === 'assembly' && params.compPrice >= 900 && sell >= params.compPrice) {
    sell = Math.floor(params.compPrice) - 1;
    notes.push('Capped just below comp for high-ticket assembly');
  }

  return {
    sellPrice: sell,
    method,
    compDiscountUsed: discount,
    marginPct: marginPct(cost, sell),
    notes,
  };
}

/** Known calibration anchors for QA / documentation. */
export const PRICING_CALIBRATION_EXAMPLES = [
  { sku: 'CT298-8722', cost: 694.33, comp: 949.43, expectedSell: 899 },
  { sku: 'GN123137', cost: 117.3, comp: 209.68, expectedSell: 199 },
  { sku: 'JL91563158', cost: 777.65, comp: 988.78, expectedSell: 979 },
] as const;
