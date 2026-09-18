import assert from 'node:assert/strict';
import { buildHeroCleanPrompt, HERO_AI_CLEAN_MODEL } from './heroAiClean';
import type { WatchRow } from './magWatchUniverse';

const row: WatchRow = {
  id: 'row-1',
  sku: '333D2714',
  slug: 'jcb-333-d2714-lower-door',
  name: 'JCB Lower Door 333/D2714',
  brand: 'JCB',
  category: 'Construction Equipment Parts',
  category_slug: 'construction-equipment-parts',
  sales_type: 'quote_only',
  is_in_stock: false,
  price: null,
  price_cents: null,
  oem_reference: '333/D2714',
  stripe_price_id: null,
  stripe_product_id: null,
  image_url: null,
  metadata: null,
};

const prompt = buildHeroCleanPrompt(row);
assert.match(prompt, /333\/D2714/);
assert.match(prompt, /watermark/i);
assert.match(prompt, /Do not add any lettering/);
assert.equal(HERO_AI_CLEAN_MODEL, 'google/gemini-3.1-flash-image-preview');

console.log('heroAiClean.test.ts: ok');
