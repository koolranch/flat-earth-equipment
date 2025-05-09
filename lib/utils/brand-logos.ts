import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function getBrandLogoUrl(brandSlug: string): string {
  // Normalize slug: lowercase, spaces & underscores → hyphens
  const normalizedSlug = brandSlug.toLowerCase().replace(/[\s_]+/g, "-");

  // Use .png for these brands, otherwise .webp
  const pngBrands = ["enersys", "liugong"];
  const ext = pngBrands.includes(normalizedSlug) ? "png" : "webp";

  // Get public URL from Supabase storage
  const { data: { publicUrl } } = supabase
    .storage
    .from("brand-logos")
    .getPublicUrl(`${normalizedSlug}.${ext}`);

  return publicUrl;
}

export function getBrandLogoProps(brandSlug: string, brandName: string) {
  return {
    src: getBrandLogoUrl(brandSlug),
    alt: `${brandName} logo`,
    onError: (e: any) => {
      console.error(`Failed to load logo for ${brandName}:`, e);
      // Set a fallback image if needed
      e.target.src = '/images/placeholder-logo.webp';
    }
  };
} 