import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { sanitizeSearchTerm } from '@/lib/parts/catalogQuery';
import { getCustomerPartNumber, getCustomerProductName } from '@/lib/parts/vendorOemPrefix';

export const dynamic = 'force-dynamic';

const MIN_QUERY_LENGTH = 3;
const MAX_SUGGESTIONS = 8;

export type PartSuggestion = {
  slug: string;
  name: string;
  partNumber: string;
  category: string | null;
  price: number | null;
  quoteOnly: boolean;
};

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('q') ?? '';
  const term = sanitizeSearchTerm(raw);

  if (term.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ suggestions: [] });
  }

  const pattern = `%${term}%`;
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('parts')
    .select('slug, name, sku, oem_reference, brand, category, price, sales_type, stripe_price_id')
    .or(
      [
        `name.ilike.${pattern}`,
        `sku.ilike.${pattern}`,
        `oem_reference.ilike.${pattern}`,
        `brand.ilike.${pattern}`,
      ].join(','),
    )
    .order('is_in_stock', { ascending: false, nullsFirst: false })
    .order('sales_type', { ascending: true })
    .limit(MAX_SUGGESTIONS);

  if (error) {
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }

  const suggestions: PartSuggestion[] = (data ?? []).map((part) => {
    const price = Number(part.price ?? 0);
    const quoteOnly =
      part.sales_type === 'quote_only' || !part.stripe_price_id || price <= 0;

    return {
      slug: part.slug,
      name: getCustomerProductName(part.name, part.brand),
      partNumber:
        getCustomerPartNumber({
          brand: part.brand,
          sku: part.sku,
          oemReference: part.oem_reference,
        }) || part.sku,
      category: part.category ?? null,
      price: quoteOnly ? null : price,
      quoteOnly,
    };
  });

  return NextResponse.json(
    { suggestions },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } },
  );
}
