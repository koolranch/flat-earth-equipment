/**
 * Universal Compatibility Hub - Data & Utilities
 * 
 * Contains static compatibility data mapping forklift models to Stripe products.
 * Used for:
 * 1. Static generation of /compatibility/[brand]/[model] pages
 * 2. Populating the CompatibilityHub component
 * 3. SEO landing page generation
 */

// =============================================================================
// Types
// =============================================================================

export interface CompatibilityEntry {
  brand: string;
  model: string;
  slug: string; // URL-safe model identifier
  products: Array<{
    stripeProductId: string;
    productName: string;
    productSlug: string;
    partNumber: string;
    oemRef?: string; // Primary OEM reference for this model
  }>;
  /** Optional related repair components (e.g., power modules for complete chargers) */
  repairComponents?: Array<{
    stripeProductId: string;
    productName: string;
    productSlug: string;
    partNumber: string;
    description?: string;
  }>;
}

// =============================================================================
// Static Compatibility Data
// =============================================================================

export const COMPATIBILITY_DATA: CompatibilityEntry[] = [
  // Delta-Q IC650 Compatible Models
  { 
    brand: 'JLG', 
    model: '1930ES', 
    slug: '1930es',
    products: [{ 
      stripeProductId: 'prod_TjW1umJ70ouQyJ', 
      productName: 'Delta-Q IC650',
      productSlug: 'delta-q-ic650',
      partNumber: 'IC650 (940-0001)',
      oemRef: '0270001',
    }]
  },
  { 
    brand: 'JLG', 
    model: '2030ES', 
    slug: '2030es',
    products: [{ 
      stripeProductId: 'prod_TjW1umJ70ouQyJ', 
      productName: 'Delta-Q IC650',
      productSlug: 'delta-q-ic650',
      partNumber: 'IC650 (940-0001)',
      oemRef: '1001129555',
    }]
  },
  { 
    brand: 'JLG', 
    model: '2630ES', 
    slug: '2630es',
    products: [{ 
      stripeProductId: 'prod_TjW1umJ70ouQyJ', 
      productName: 'Delta-Q IC650',
      productSlug: 'delta-q-ic650',
      partNumber: 'IC650 (940-0001)',
      oemRef: '1001129555',
    }]
  },
  { 
    brand: 'Genie', 
    model: 'GS-1930', 
    slug: 'gs-1930',
    products: [{ 
      stripeProductId: 'prod_TjW1umJ70ouQyJ', 
      productName: 'Delta-Q IC650',
      productSlug: 'delta-q-ic650',
      partNumber: 'IC650 (940-0001)',
      oemRef: '105739',
    }]
  },
  { 
    brand: 'Genie', 
    model: 'GS-1932', 
    slug: 'gs-1932',
    products: [{ 
      stripeProductId: 'prod_TjW1umJ70ouQyJ', 
      productName: 'Delta-Q IC650',
      productSlug: 'delta-q-ic650',
      partNumber: 'IC650 (940-0001)',
      oemRef: '1319032GT',
    }]
  },
  { 
    brand: 'Skyjack', 
    model: 'SJIII 3219', 
    slug: 'sjiii-3219',
    products: [{ 
      stripeProductId: 'prod_TjW1umJ70ouQyJ', 
      productName: 'Delta-Q IC650',
      productSlug: 'delta-q-ic650',
      partNumber: 'IC650 (940-0001)',
      oemRef: '161827',
    }]
  },
  { 
    brand: 'Skyjack', 
    model: 'SJIII 3226', 
    slug: 'sjiii-3226',
    products: [{ 
      stripeProductId: 'prod_TjW1umJ70ouQyJ', 
      productName: 'Delta-Q IC650',
      productSlug: 'delta-q-ic650',
      partNumber: 'IC650 (940-0001)',
      oemRef: '161827',
    }]
  },
  { 
    brand: 'BT', 
    model: 'Levio', 
    slug: 'levio',
    products: [{ 
      stripeProductId: 'prod_TjW1umJ70ouQyJ', 
      productName: 'Delta-Q IC650',
      productSlug: 'delta-q-ic650',
      partNumber: 'IC650 (940-0001)',
    }]
  },
  
  // Delta-Q 913-4800 Compatible Models
  { 
    brand: 'EZGO', 
    model: 'RXV', 
    slug: 'rxv',
    products: [{ 
      stripeProductId: 'prod_TjW123kj1iHtXV', 
      productName: 'Delta-Q 913-4800',
      productSlug: 'delta-q-913-4800',
      partNumber: '913-4800',
      oemRef: '603689',
    }]
  },
  { 
    brand: 'EZGO', 
    model: 'TXT', 
    slug: 'txt',
    products: [{ 
      stripeProductId: 'prod_TjW123kj1iHtXV', 
      productName: 'Delta-Q 913-4800',
      productSlug: 'delta-q-913-4800',
      partNumber: '913-4800',
      oemRef: '9134800E5',
    }]
  },
  { 
    brand: 'Taylor-Dunn', 
    model: 'Bigfoot', 
    slug: 'bigfoot',
    products: [{ 
      stripeProductId: 'prod_TjW123kj1iHtXV', 
      productName: 'Delta-Q 913-4800',
      productSlug: 'delta-q-913-4800',
      partNumber: '913-4800',
      oemRef: '73051-G20',
    }]
  },
  { 
    brand: 'Cushman', 
    model: 'Hauler', 
    slug: 'hauler',
    products: [{ 
      stripeProductId: 'prod_TjW123kj1iHtXV', 
      productName: 'Delta-Q 913-4800',
      productSlug: 'delta-q-913-4800',
      partNumber: '913-4800',
      oemRef: '913-4800-03',
    }]
  },
  { 
    brand: 'Cushman', 
    model: 'Shuttle', 
    slug: 'shuttle',
    products: [{ 
      stripeProductId: 'prod_TjW123kj1iHtXV', 
      productName: 'Delta-Q 913-4800',
      productSlug: 'delta-q-913-4800',
      partNumber: '913-4800',
      oemRef: '913-4800-03',
    }]
  },
  
  // SPE Green6 48V 150A COMPLETE CHARGER - Industrial Forklifts
  // NOTE: prod_TdBtS3QHCKsiFS is the COMPLETE CHARGER (correct for forklift replacement)
  // prod_SqjmLeEubqVsMi is the POWER MODULE (repair part only)
  { 
    brand: 'Toyota', 
    model: '8FBCU25', 
    slug: '8fbcu25',
    products: [{ 
      stripeProductId: 'prod_TdBtS3QHCKsiFS', // Complete Charger
      productName: 'SPE Green6 48V 150A Complete Charger',
      productSlug: 'spe-green6-48v-150a',
      partNumber: 'GREEN6 48V 150A (24-GREEN6IP54-48150)',
      oemRef: '57590-32840-71',
    }],
    repairComponents: [{
      stripeProductId: 'prod_SqjmLeEubqVsMi',
      productName: 'SPE Green6 Power Module',
      productSlug: 'spe-green6-power-module',
      partNumber: '24-279-012',
      description: 'Internal replacement module for existing GREEN6 charger cabinets',
    }],
  },
  { 
    brand: 'Toyota', 
    model: '7FBE15', 
    slug: '7fbe15',
    products: [{ 
      stripeProductId: 'prod_TdBtS3QHCKsiFS', // Complete Charger
      productName: 'SPE Green6 48V 150A Complete Charger',
      productSlug: 'spe-green6-48v-150a',
      partNumber: 'GREEN6 48V 150A (24-GREEN6IP54-48150)',
      oemRef: '57590-32840-71',
    }],
    repairComponents: [{
      stripeProductId: 'prod_SqjmLeEubqVsMi',
      productName: 'SPE Green6 Power Module',
      productSlug: 'spe-green6-power-module',
      partNumber: '24-279-012',
      description: 'Internal replacement module for existing GREEN6 charger cabinets',
    }],
  },
  { 
    brand: 'Hyster', 
    model: 'E50XN', 
    slug: 'e50xn',
    products: [{ 
      stripeProductId: 'prod_TdBtS3QHCKsiFS', // Complete Charger
      productName: 'SPE Green6 48V 150A Complete Charger',
      productSlug: 'spe-green6-48v-150a',
      partNumber: 'GREEN6 48V 150A (24-GREEN6IP54-48150)',
      oemRef: '4603626',
    }],
    repairComponents: [{
      stripeProductId: 'prod_SqjmLeEubqVsMi',
      productName: 'SPE Green6 Power Module',
      productSlug: 'spe-green6-power-module',
      partNumber: '24-279-012',
      description: 'Internal replacement module for existing GREEN6 charger cabinets',
    }],
  },
  { 
    brand: 'Yale', 
    model: 'ERC050', 
    slug: 'erc050',
    products: [{ 
      stripeProductId: 'prod_TdBtS3QHCKsiFS', // Complete Charger
      productName: 'SPE Green6 48V 150A Complete Charger',
      productSlug: 'spe-green6-48v-150a',
      partNumber: 'GREEN6 48V 150A (24-GREEN6IP54-48150)',
      oemRef: '524245865',
    }],
    repairComponents: [{
      stripeProductId: 'prod_SqjmLeEubqVsMi',
      productName: 'SPE Green6 Power Module',
      productSlug: 'spe-green6-power-module',
      partNumber: '24-279-012',
      description: 'Internal replacement module for existing GREEN6 charger cabinets',
    }],
  },
  { 
    brand: 'Jungheinrich', 
    model: 'EFG Series', 
    slug: 'efg-series',
    products: [{ 
      stripeProductId: 'prod_TdBtS3QHCKsiFS', // Complete Charger
      productName: 'SPE Green6 48V 150A Complete Charger',
      productSlug: 'spe-green6-48v-150a',
      partNumber: 'GREEN6 48V 150A (24-GREEN6IP54-48150)',
    }],
    repairComponents: [{
      stripeProductId: 'prod_SqjmLeEubqVsMi',
      productName: 'SPE Green6 Power Module',
      productSlug: 'spe-green6-power-module',
      partNumber: '24-279-012',
      description: 'Internal replacement module for existing GREEN6 charger cabinets',
    }],
  },
  { 
    brand: 'Cat', 
    model: 'F50', 
    slug: 'f50',
    products: [{ 
      stripeProductId: 'prod_TdBtS3QHCKsiFS', // Complete Charger
      productName: 'SPE Green6 48V 150A Complete Charger',
      productSlug: 'spe-green6-48v-150a',
      partNumber: 'GREEN6 48V 150A (24-GREEN6IP54-48150)',
    }],
    repairComponents: [{
      stripeProductId: 'prod_SqjmLeEubqVsMi',
      productName: 'SPE Green6 Power Module',
      productSlug: 'spe-green6-power-module',
      partNumber: '24-279-012',
      description: 'Internal replacement module for existing GREEN6 charger cabinets',
    }],
  },
];

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get compatibility entry by brand and model slug
 */
export function getCompatibilityBySlug(brand: string, modelSlug: string): CompatibilityEntry | undefined {
  return COMPATIBILITY_DATA.find(
    entry => entry.brand.toLowerCase() === brand.toLowerCase() && entry.slug === modelSlug
  );
}

/**
 * Get all compatibility entries for a brand
 */
export function getCompatibilityByBrand(brand: string): CompatibilityEntry[] {
  return COMPATIBILITY_DATA.filter(
    entry => entry.brand.toLowerCase() === brand.toLowerCase()
  );
}

/**
 * Get all unique brands from compatibility data
 */
export function getAllBrands(): string[] {
  return [...new Set(COMPATIBILITY_DATA.map(entry => entry.brand))];
}

/**
 * Get all model slugs for a given brand (for static path generation)
 */
export function getModelSlugsByBrand(brand: string): string[] {
  return COMPATIBILITY_DATA
    .filter(entry => entry.brand.toLowerCase() === brand.toLowerCase())
    .map(entry => entry.slug);
}

