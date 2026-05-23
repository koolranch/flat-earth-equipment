/**
 * Verify pricing calibration examples (no DB/Stripe).
 * Run: npx tsx scripts/verify-pricing-calibration.ts
 */

import {
  calculateSellPrice,
  PRICING_CALIBRATION_EXAMPLES,
  categoryFromPartCategory,
} from '../lib/pricing/calculateSellPrice';

let failed = 0;

for (const ex of PRICING_CALIBRATION_EXAMPLES) {
  const compDiscount = ex.sku === 'JL91563158' ? 0.01 : undefined;
  const category =
    ex.sku === 'GN123137' ? 'assembly' : ex.sku.startsWith('JL702') ? 'cushion' : 'assembly';

  const result = calculateSellPrice({
    cost: ex.cost,
    compPrice: ex.comp,
    category,
    compDiscount,
  });

  const ok = result.sellPrice === ex.expectedSell;
  if (!ok) {
    failed++;
    console.log(`❌ ${ex.sku}: got $${result.sellPrice}, expected $${ex.expectedSell}`);
  } else {
    console.log(`✅ ${ex.sku}: $${result.sellPrice} (${result.method}, ${(result.marginPct * 100).toFixed(1)}% margin)`);
  }
}

process.exit(failed > 0 ? 1 : 0);
