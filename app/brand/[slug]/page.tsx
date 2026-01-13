import { redirect } from 'next/navigation';
import { getBrand } from '@/lib/brands';

// Brands that have working serial lookup tools
const BRANDS_WITH_SERIAL_TOOLS = new Set([
  'toyota', 'hyster', 'bobcat', 'crown', 'clark', 'cat', 'caterpillar',
  'doosan', 'jlg', 'karcher', 'factory-cat', 'factorycat', 'tennant',
  'haulotte', 'yale', 'raymond', 'ep', 'ep-equipment', 'linde',
  'mitsubishi', 'komatsu', 'case', 'case-construction', 'new-holland',
  'takeuchi', 'kubota', 'toro', 'xcmg', 'sinoboom', 'skyjack',
  'jungheinrich', 'gehl', 'hangcha', 'lull', 'manitou', 'unicarriers',
  'jcb', 'genie', 'hyundai'
]);

export default async function BrandSlugPage({ params }: { params: { slug: string } }) {
  const brand = await getBrand(params.slug);
  
  // If brand exists and has a serial tool, redirect to serial-lookup
  if (brand && BRANDS_WITH_SERIAL_TOOLS.has(params.slug)) {
    redirect(`/brand/${params.slug}/serial-lookup`);
  }
  
  // For brands without serial tools OR brands that exist but don't have serial tools,
  // redirect to fault-codes page (which is available for all brands)
  redirect(`/brand/${params.slug}/fault-codes`);
}
