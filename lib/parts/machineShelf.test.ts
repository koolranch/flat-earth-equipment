import assert from 'node:assert/strict';
import {
  canonicalShelfBrand,
  cleanShelfModels,
  formatShelfPrice,
  presentFeaturedMachines,
  resolveShelfSelection,
  shelfPriceLabel,
  toShelfPart,
  type ShelfPart,
} from './machineShelf';

function part(overrides: Partial<ShelfPart> & Pick<ShelfPart, 'slug' | 'brand' | 'models'>): ShelfPart {
  return {
    name: overrides.name ?? overrides.slug,
    categorySlug: overrides.categorySlug ?? 'seats',
    salesType: overrides.salesType ?? 'direct',
    price: overrides.price === undefined ? 100 : overrides.price,
    inStock: overrides.inStock ?? true,
    backordered: overrides.backordered ?? false,
    warranty: overrides.warranty ?? false,
    imageUrl: overrides.imageUrl ?? null,
    ...overrides,
  };
}

assert.equal(canonicalShelfBrand('Powerboss'), 'Power Boss');
assert.equal(canonicalShelfBrand('PowerBoss'), 'Power Boss');
assert.equal(canonicalShelfBrand('  Power Boss '), 'Power Boss');
assert.equal(canonicalShelfBrand('Skytrack'), 'Skytrack');

assert.deepEqual(cleanShelfModels([' T650 ', 't650', 'Universal — fits all', 'A', '95'], 'Bobcat'), [
  'T650',
  '95',
]);
assert.deepEqual(cleanShelfModels(['bobcat-s650'], 'Bobcat'), ['S650']);
assert.deepEqual(cleanShelfModels(['jcb-507-42'], 'JCB'), ['507-42']);
assert.deepEqual(cleanShelfModels(['ezgo-rxv'], 'Cushman'), ['EZGO-RXV']);

assert.equal(shelfPriceLabel(part({ slug: 'a', brand: 'Bobcat', models: ['T650'], price: 0 })).kind, 'quote');
assert.equal(
  shelfPriceLabel(part({ slug: 'a', brand: 'Bobcat', models: ['T650'], salesType: 'quote_only', price: 400 })).text,
  'Request quote',
);
assert.equal(shelfPriceLabel(part({ slug: 'a', brand: 'Bobcat', models: ['T650'], price: 949 })).text, '$949');
assert.equal(formatShelfPrice(91.5), '$91.50');

const dropped = toShelfPart({
  slug: 'bad',
  name: 'TSA/SY400 track',
  brand: 'Bobcat',
  sales_type: 'direct',
  compatible_models: ['T190'],
  price: 949,
});
assert.equal(dropped, null);

const selection = resolveShelfSelection(
  [
    part({
      slug: 'track',
      name: 'Track',
      brand: 'Bobcat',
      categorySlug: 'rubber-tracks',
      models: ['T650', 'T550'],
      price: 949,
    }),
    part({
      slug: 'glass',
      name: 'Door glass',
      brand: 'Bobcat',
      categorySlug: 'cab-glass',
      models: ['T650'],
      price: 180,
    }),
    part({
      slug: 'broom',
      name: 'Main broom',
      brand: 'Powerboss',
      categorySlug: 'brooms',
      models: ['95'],
      salesType: 'quote_only',
      price: null,
    }),
    part({
      slug: 'quote-seat',
      name: 'Seat',
      brand: 'Bobcat',
      categorySlug: 'seats',
      models: ['T650'],
      salesType: 'quote_only',
      price: 50,
    }),
    part({
      slug: 'track',
      name: 'Track duplicate',
      brand: 'Bobcat',
      categorySlug: 'rubber-tracks',
      models: ['T650'],
      price: 1,
    }),
  ],
  'bobcat',
  't650',
);

assert.equal(selection.brand, 'Bobcat');
assert.equal(selection.model, 'T650');
assert.equal(selection.modelCounts.T650, 3);
assert.equal(selection.modelCounts.T550, 1);
assert.deepEqual(
  selection.groups.map((group) => group.categorySlug),
  ['rubber-tracks', 'cab-glass', 'seats'],
);
assert.equal(selection.groups[0]?.parts.length, 1);
assert.equal(selection.groups[0]?.parts[0]?.slug, 'track');
assert.equal(selection.groups[0]?.hubHref, '/rubber-tracks');
assert.equal(selection.groups[2]?.parts[0]?.slug, 'quote-seat');
assert.equal(selection.brands[0]?.name, 'Bobcat');
assert.ok(selection.brands.some((brand) => brand.name === 'Power Boss'));
assert.equal(selection.unknownBrand, false);
assert.equal(selection.unknownModel, false);

const missing = resolveShelfSelection(
  [part({ slug: 'track', brand: 'Bobcat', models: ['T650'] })],
  'Bobcat',
  'T999',
);
assert.equal(missing.unknownModel, true);
assert.equal(missing.groups.length, 0);
assert.equal(missing.models[0], 'T650');
assert.deepEqual(missing.featured, [{ brand: 'Bobcat', model: 'T650' }]);
assert.deepEqual(
  presentFeaturedMachines([
    part({ slug: 'a', brand: 'Bobcat', models: ['T650'] }),
    part({ slug: 'b', brand: 'Skyjack', models: ['SJRT 9999'] }),
  ]),
  [{ brand: 'Bobcat', model: 'T650' }],
);
