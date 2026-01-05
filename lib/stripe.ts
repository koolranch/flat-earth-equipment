/**
 * Stripe Product & Metadata Utilities
 * 
 * Provides typed interfaces and helper functions for fetching
 * Stripe products with SEO-optimized metadata.
 */

import Stripe from 'stripe';

// Initialize Stripe (server-side only)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// =============================================================================
// Types
// =============================================================================

export interface ProductSeoMetadata {
  // Technical Specifications (spec_* keys)
  spec_thermal_torque?: string;
  spec_input_fuse?: string;
  spec_output_fuse?: string;
  spec_igbt_mounting?: string;
  spec_thermal_pad?: string;
  spec_operating_temp?: string;
  spec_input_voltage?: string;
  spec_output_current?: string;
  spec_efficiency?: string;
  spec_communication?: string;
  
  // SEO Content
  seo_pro_tip?: string;
  seo_information_gain?: string;
  
  // Fault Codes (pipe-delimited)
  fault_codes?: string;
  
  // Compatibility
  compatible_chargers?: string;
  
  // SKU identifier
  sku?: string;
  
  // Allow additional spec_* keys
  [key: string]: string | undefined;
}

export interface ProductWithMetadata {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  metadata: ProductSeoMetadata;
  defaultPrice: {
    id: string;
    unitAmount: number | null;
    currency: string;
  } | null;
  active: boolean;
  created: number;
  updated: number;
}

export interface ParsedFaultCode {
  code: string;
  description: string;
}

// =============================================================================
// Product Fetching Functions
// =============================================================================

/**
 * Fetch a single Stripe product by ID with full metadata
 */
export async function getStripeProduct(productId: string): Promise<ProductWithMetadata | null> {
  try {
    const product = await stripe.products.retrieve(productId, {
      expand: ['default_price'],
    });

    const defaultPrice = product.default_price as Stripe.Price | null;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      metadata: product.metadata as ProductSeoMetadata,
      defaultPrice: defaultPrice ? {
        id: defaultPrice.id,
        unitAmount: defaultPrice.unit_amount,
        currency: defaultPrice.currency,
      } : null,
      active: product.active,
      created: product.created,
      updated: product.updated,
    };
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
}

/**
 * Fetch a Stripe product by SKU metadata
 */
export async function getStripeProductBySku(sku: string): Promise<ProductWithMetadata | null> {
  try {
    const products = await stripe.products.search({
      query: `metadata['sku']:'${sku}'`,
      limit: 1,
      expand: ['data.default_price'],
    });

    if (products.data.length === 0) {
      return null;
    }

    const product = products.data[0];
    const defaultPrice = product.default_price as Stripe.Price | null;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      metadata: product.metadata as ProductSeoMetadata,
      defaultPrice: defaultPrice ? {
        id: defaultPrice.id,
        unitAmount: defaultPrice.unit_amount,
        currency: defaultPrice.currency,
      } : null,
      active: product.active,
      created: product.created,
      updated: product.updated,
    };
  } catch (error) {
    console.error(`Error fetching product by SKU ${sku}:`, error);
    return null;
  }
}

/**
 * Fetch multiple Stripe products with metadata (e.g., charger modules)
 */
export async function getStripeProductsByIds(productIds: string[]): Promise<ProductWithMetadata[]> {
  const products: ProductWithMetadata[] = [];

  for (const id of productIds) {
    const product = await getStripeProduct(id);
    if (product) {
      products.push(product);
    }
  }

  return products;
}

// =============================================================================
// Metadata Parsing Utilities
// =============================================================================

/**
 * Extract all spec_* keys from metadata and format for display
 */
export function extractSpecsFromMetadata(metadata: ProductSeoMetadata): Array<{ label: string; value: string }> {
  const specs: Array<{ label: string; value: string }> = [];

  for (const [key, value] of Object.entries(metadata)) {
    if (key.startsWith('spec_') && value) {
      // Convert spec_thermal_torque to "Thermal Torque"
      const label = key
        .replace('spec_', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      specs.push({ label, value });
    }
  }

  return specs;
}

/**
 * Parse pipe-delimited fault codes into structured array
 * Input: "DF3: Improper Battery|TH: Overheating|DF4: Overdischarged"
 * Output: [{ code: "DF3", description: "Improper Battery" }, ...]
 */
export function parseFaultCodes(faultCodesString: string | undefined): ParsedFaultCode[] {
  if (!faultCodesString) {
    return [];
  }

  return faultCodesString.split('|').map(item => {
    const [code, ...descParts] = item.split(':');
    return {
      code: code.trim(),
      description: descParts.join(':').trim(),
    };
  });
}

/**
 * Parse comma-separated compatible chargers into array
 */
export function parseCompatibleChargers(compatibleString: string | undefined): string[] {
  if (!compatibleString) {
    return [];
  }

  return compatibleString.split(',').map(s => s.trim());
}

// =============================================================================
// SEO Helpers
// =============================================================================

/**
 * Generate SEO-optimized meta description from product metadata
 */
export function generateMetaDescription(product: ProductWithMetadata): string {
  const { metadata, name } = product;
  
  // Use seo_pro_tip if available (snippet-optimized)
  if (metadata.seo_pro_tip) {
    return metadata.seo_pro_tip.slice(0, 160);
  }
  
  // Fallback to product description
  if (product.description) {
    return product.description.slice(0, 160);
  }
  
  // Generate default
  return `Buy ${name}. Remanufactured with 6-month warranty. Free shipping. Same-day dispatch.`;
}

/**
 * Generate structured data for Product schema
 */
export function generateProductSchema(product: ProductWithMetadata, url: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || generateMetaDescription(product),
    image: product.images[0] || undefined,
    sku: product.metadata.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.name.includes('Enersys') ? 'Enersys' : 
            product.name.includes('Hawker') ? 'Hawker' : 'Flat Earth Equipment',
    },
    offers: product.defaultPrice ? {
      '@type': 'Offer',
      price: (product.defaultPrice.unitAmount! / 100).toFixed(2),
      priceCurrency: product.defaultPrice.currency.toUpperCase(),
      availability: 'https://schema.org/InStock',
      url,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    } : undefined,
  };
}

export { stripe };

