import { supabaseServer } from '@/lib/supabase/server';

export type FaultPartsCategory = {
  key: string;
  label: string;
  blurb: string;
  catalogHref: string;
  categories: string[];
};

export type FaultPartCard = {
  slug: string;
  name: string;
  price: number;
  oem_reference: string | null;
  category: string;
  image_url: string | null;
};

export type FaultPartsGroup = FaultPartsCategory & {
  parts: FaultPartCard[];
};

const JCB_PARTS_GROUPS: FaultPartsCategory[] = [
  {
    key: 'filters',
    label: 'Filters',
    blurb: 'Often the first swap on fuel, oil, and hydraulic pressure codes.',
    catalogHref: '/parts?brand=JCB&category=JCB%20Filters',
    categories: ['JCB Filters', 'Fluids & Filters'],
  },
  {
    key: 'fuel',
    label: 'Fuel system',
    blurb: 'Lift pumps, fuel elements, and rail-related parts for P0087-style faults.',
    catalogHref: '/parts?brand=JCB&category=JCB%20Fuel%20System',
    categories: ['JCB Fuel System'],
  },
  {
    key: 'sensors',
    label: 'Switches & sensors',
    blurb: 'Pressure, temp, and speed sensors that throw codes before major failures.',
    catalogHref: '/parts?brand=JCB&category=JCB%20Switches%20%26%20Sensors',
    categories: ['JCB Switches & Sensors'],
  },
  {
    key: 'engine',
    label: 'Engine parts',
    blurb: 'Cooling, EGR, turbo, and related engine components after basic checks.',
    catalogHref: '/parts?brand=JCB&category=JCB%20Engine%20Parts',
    categories: ['JCB Engine Parts', 'JCB Cooling'],
  },
];

export async function getJcbFaultLikelyParts(limitPerGroup = 3): Promise<FaultPartsGroup[]> {
  const supabase = supabaseServer();
  const allCategories = Array.from(new Set(JCB_PARTS_GROUPS.flatMap((g) => g.categories)));

  const { data, error } = await supabase
    .from('parts')
    .select('slug, name, price, oem_reference, category, image_url')
    .ilike('brand', 'jcb')
    .in('category', allCategories)
    .gt('price', 0)
    .order('price', { ascending: true })
    .limit(80);

  if (error || !data?.length) {
    return JCB_PARTS_GROUPS.map((g) => ({ ...g, parts: [] }));
  }

  return JCB_PARTS_GROUPS.map((group) => {
    const parts = data
      .filter((p) => group.categories.includes(p.category))
      .slice(0, limitPerGroup)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        price: Number(p.price) || 0,
        oem_reference: p.oem_reference,
        category: p.category,
        image_url: p.image_url,
      }));
    return { ...group, parts };
  });
}
