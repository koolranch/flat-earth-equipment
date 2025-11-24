/**
 * Insert Helmar products using direct SQL via Supabase MCP
 * This bypasses the need for service role keys
 */

// Product data with pricing
const PRODUCTS = [
  { helmarSku: 'FM-1-200', name: 'FORK MT RUG RAM (10X2 1/2)', dealerPrice: 840, specs: { diameter: '2.5"', baseSize: '543*116*1040 (MM)', effectiveLength: '10 feet', capacity: '1500kg @ 500mm', weight: '163kg' }},
  { helmarSku: 'FM-1-300', name: 'FORK MT RUG RAM (10X2 3/4)', dealerPrice: 980, specs: { diameter: '2.75"', baseSize: '543*116*1040 (MM)', effectiveLength: '10 feet', capacity: '2000kg @ 500mm', weight: '190kg' }},
  { helmarSku: 'FM-1-400', name: 'FORK MT RUG RAM (12X2 1/2)', dealerPrice: 880, specs: { diameter: '2.5"', baseSize: '543*116*1040 (MM)', effectiveLength: '12 feet', capacity: '1500kg @ 500mm', weight: '205kg' }},
  { helmarSku: 'FM-1-500', name: 'FORK MT RUG RAM (12X2 3/4)', dealerPrice: 965, specs: { diameter: '2.75"', baseSize: '543*126*1040 (MM)', effectiveLength: '12 feet', capacity: '2000kg @ 500mm', weight: '222kg' }},
  { helmarSku: 'RR-2-206', name: 'RUG RAM (CLASS II 9X2 3/4)', dealerPrice: 995, specs: { diameter: '2.75"', effectiveLength: '9 feet', capacity: 'Class II' }},
  { helmarSku: 'RR-2-209', name: 'RUG RAM (CLASS II (10X2 3/4)', dealerPrice: 650, specs: { diameter: '2.75"', effectiveLength: '10 feet', capacity: 'Class II' }},
  { helmarSku: 'RR-2-214', name: 'RUG RAM (CLASS II (10X3)', dealerPrice: 875, specs: { diameter: '3"', effectiveLength: '10 feet', capacity: 'Class II' }},
  { helmarSku: 'RR-2-219', name: 'RUG RAM (CLASS II (12X2 1/2)', dealerPrice: 725, specs: { diameter: '2.5"', effectiveLength: '12 feet', capacity: 'Class II' }},
  { helmarSku: 'RR-2-224', name: 'RUG RAM (CLASS II 12X2 3/4)', dealerPrice: 650, specs: { diameter: '2.75"', effectiveLength: '12 feet', capacity: 'Class II' }},
  { helmarSku: 'RR-3-310', name: 'RUG RAM (CLASS III (10X2 3/4)', dealerPrice: 740, specs: { diameter: '2.75"', effectiveLength: '10 feet', capacity: 'Class III' }},
  { helmarSku: 'RR-3-316', name: 'RUG RAM (CLASS III (12X2 3/4)', dealerPrice: 895, specs: { diameter: '2.75"', effectiveLength: '12 feet', capacity: 'Class III' }},
];

const MARKUP = 1.40;

function formatDescription(specs: any): string {
  const parts = [];
  if (specs.diameter) parts.push(`Diameter: ${specs.diameter}`);
  if (specs.baseSize) parts.push(`Base Size: ${specs.baseSize}`);
  if (specs.effectiveLength) parts.push(`Effective Length: ${specs.effectiveLength}`);
  if (specs.capacity) parts.push(`Capacity: ${specs.capacity}`);
  if (specs.weight) parts.push(`Weight: ${specs.weight}`);
  
  return `Fork mounted rug ram. ${parts.join(', ')}. 1 Year Warranty.`;
}

function createSlug(sku: string, name: string): string {
  return `${sku}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate SQL INSERT statements
const sqlStatements = PRODUCTS.map((product, index) => {
  const internalSku = `FEE-RC-${String(index + 1).padStart(3, '0')}`;
  const retailPrice = (product.dealerPrice * MARKUP).toFixed(2);
  const slug = createSlug(internalSku, product.name);
  const description = formatDescription(product.specs);
  const metadata = JSON.stringify({
    specifications: product.specs,
    vendor: {
      name: 'Helmar',
      partNumber: product.helmarSku,
      originalUrl: `https://www.helmarparts.info/ProductDetails?pn=${product.helmarSku}`
    },
    warranty: '1 Year',
    dealerCost: product.dealerPrice
  });
  
  return `
INSERT INTO parts (sku, vendor_sku, name, slug, price, category, brand, description, image_url, metadata, created_at, updated_at)
VALUES (
  '${internalSku}',
  '${product.helmarSku}',
  '${product.name.replace(/'/g, "''")}',
  '${slug}',
  ${retailPrice},
  'Rug / Carpet Rams',
  'Helmar',
  '${description.replace(/'/g, "''")}',
  'https://www.helmarparts.info/Products/FM-1-200_xr.jpg',
  '${metadata.replace(/'/g, "''")}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (sku) DO UPDATE SET
  price = EXCLUDED.price,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();
`;
}).join('\n');

console.log('Generated SQL for 11 Helmar products:\n');
console.log(sqlStatements);
console.log('\n\n=== USE SUPABASE MCP TO EXECUTE THIS SQL ===');
console.log('Call: mcp_supabase_execute_sql');
console.log('project_id: mzsozezflbhebykncbmr');
console.log('query: <paste the SQL above>');

