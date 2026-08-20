import assert from 'node:assert/strict';
import {
  buildLithiumRhinoMetaDescription,
  lithiumCapacityLinksForProduct,
  lithiumCapacityPositioningForProduct,
} from './lithiumRhinoSeo';

const kitDescription = buildLithiumRhinoMetaDescription({
  category: 'Lithium Batteries',
  sku: '113-LR51V65AH',
  metadata: {
    voltage: '48V',
    capacity: '65Ah',
    product_type: 'kit',
  },
});

assert.equal(
  kitDescription,
  'Lithium Rhino 48V 65Ah LiFePO4 golf cart conversion kit, SKU 113-LR51V65AH. Includes battery, charger, DC converter, display and mounting hardware.'
);
assert.ok((kitDescription?.length ?? 0) <= 155);

const cubeDescription = buildLithiumRhinoMetaDescription({
  category: 'Lithium Batteries',
  sku: '113-LR51V105AH-CUBE-S',
  metadata: {
    voltage: '48V',
    capacity: '105Ah',
    product_type: 'battery',
    variant: 'cube',
  },
});

assert.match(cubeDescription ?? '', /48V 105Ah Cube/);
assert.match(cubeDescription ?? '', /113-LR51V105AH-CUBE-S/);
assert.match(cubeDescription ?? '', /Battery only/);
assert.doesNotMatch(cubeDescription ?? '', /conversion kit/);

const siblingLinks = lithiumCapacityLinksForProduct({
  slug: 'lithium-rhino-48v-65ah-kit',
  metadata: { voltage: '48V' },
});

assert.deepEqual(
  siblingLinks.map((kit) => kit.capacity),
  ['50Ah', '105Ah']
);
assert.ok(siblingLinks.every((kit) => kit.voltage === '48V'));
assert.ok(siblingLinks.every((kit) => kit.slug !== 'lithium-rhino-48v-65ah-kit'));

const capacityPositioning = lithiumCapacityPositioningForProduct({
  metadata: { voltage: '48V', capacity: '65Ah', product_type: 'kit' },
});

assert.match(capacityPositioning?.heading ?? '', /48V 65Ah/);
assert.match(capacityPositioning?.summary ?? '', /50Ah/);
assert.match(capacityPositioning?.summary ?? '', /105Ah/);
assert.equal(
  lithiumCapacityPositioningForProduct({
    metadata: { voltage: '48V', capacity: '105Ah', product_type: 'battery' },
  }),
  null
);
