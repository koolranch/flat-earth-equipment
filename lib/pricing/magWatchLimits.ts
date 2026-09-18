/** Dashboard batch Publish cap — each SKU creates a Stripe price. */
export const MAX_PUBLISH_BATCH = 15;

/**
 * Weekday Mag-watch downloads at most this many identity-ok in-stock heroes into the
 * private image tray. Raw photos never go live; Approve is still an operator click.
 */
export const DEFAULT_HERO_INTAKE_CAP = 40;

/** Of that cap, how many slots are reserved for quote-only stubs (the Publish queue). */
export const HERO_INTAKE_QUOTE_RESERVE = 32;

export type HeroIntakeBudget = { quote: number; buyNow: number };

export function emptyHeroIntakeBudget(
  cap = DEFAULT_HERO_INTAKE_CAP,
  quoteReserve = HERO_INTAKE_QUOTE_RESERVE
): HeroIntakeBudget {
  const quote = Math.min(quoteReserve, cap);
  return { quote, buyNow: Math.max(0, cap - quote) };
}

/** Reserve one tray-download slot. Quote-only and Buy Now have separate leftover counts. */
export function takeHeroIntakeSlot(isBuyNow: boolean, budget: HeroIntakeBudget): boolean {
  if (isBuyNow) {
    if (budget.buyNow <= 0) return false;
    budget.buyNow -= 1;
    return true;
  }
  if (budget.quote <= 0) return false;
  budget.quote -= 1;
  return true;
}
