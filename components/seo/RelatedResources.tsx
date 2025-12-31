import Link from 'next/link';

/**
 * RelatedResources Component
 * 
 * Adds internal links to relevant pages to fix "orphaned pages" SEO issue.
 * Ensures every page has multiple dofollow internal links, spreading link juice
 * and improving crawlability.
 * 
 * Usage:
 * - For parts pages: <RelatedResources type="parts" currentSlug="part-slug" />
 * - For location pages: <RelatedResources type="location" region="texas" city="houston" />
 */

interface RelatedResourcesProps {
  type: 'parts' | 'location';
  currentSlug?: string;
  region?: string;
  city?: string;
  brand?: string;
}

// Service area links for location pages
const serviceAreas = [
  { name: 'Dallas-Fort Worth', href: '/texas/dallas-fort-worth', region: 'texas' },
  { name: 'Houston', href: '/texas/houston', region: 'texas' },
  { name: 'El Paso', href: '/texas/el-paso', region: 'texas' },
  { name: 'Phoenix', href: '/arizona/phoenix', region: 'arizona' },
  { name: 'Denver', href: '/colorado/denver', region: 'colorado' },
  { name: 'Pueblo', href: '/colorado/pueblo', region: 'colorado' },
  { name: 'Albuquerque', href: '/new-mexico/albuquerque', region: 'new-mexico' },
  { name: 'Las Cruces', href: '/new-mexico/las-cruces', region: 'new-mexico' },
  { name: 'Bozeman', href: '/montana/bozeman', region: 'montana' },
  { name: 'Cheyenne', href: '/wyoming/cheyenne', region: 'wyoming' },
];

// Equipment category links for parts pages
const equipmentCategories = [
  { name: 'Forklift Parts', href: '/parts', icon: '🏗️' },
  { name: 'Charger Modules', href: '/charger-modules', icon: '🔋' },
  { name: 'Forklift Forks', href: '/forks', icon: '🔱' },
  { name: 'Equipment Rentals', href: '/rent-equipment', icon: '🚜' },
  { name: 'OSHA Training', href: '/training/forklift', icon: '📋' },
];

// Brand hub links
const brandHubs = [
  { name: 'Toyota', href: '/brand/toyota' },
  { name: 'Crown', href: '/brand/crown' },
  { name: 'Yale', href: '/brand/yale' },
  { name: 'Hyster', href: '/brand/hyster' },
  { name: 'CAT', href: '/brand/cat' },
  { name: 'JCB', href: '/brand/jcb' },
  { name: 'Bobcat', href: '/brand/bobcat' },
];

// Resource links
const resourceLinks = [
  { name: 'Serial Number Lookup', href: '/toyota-forklift-serial-lookup', icon: '🔍' },
  { name: 'Fault Code Guide', href: '/insights/forklift-error-codes', icon: '⚠️' },
  { name: 'Equipment Insights', href: '/insights', icon: '📰' },
  { name: 'Contact Support', href: '/contact', icon: '📞' },
];

export default function RelatedResources({ 
  type, 
  currentSlug, 
  region, 
  city,
  brand 
}: RelatedResourcesProps) {
  
  // Get related location links (exclude current city)
  const getRelatedLocations = () => {
    return serviceAreas
      .filter(area => {
        // Exclude current city if provided
        if (city && area.href.includes(city)) return false;
        return true;
      })
      .slice(0, 5); // Limit to 5 links
  };

  // Get related equipment links (exclude current slug)
  const getRelatedEquipment = () => {
    return equipmentCategories
      .filter(cat => !currentSlug || !cat.href.includes(currentSlug))
      .slice(0, 5);
  };

  // Get related brands (exclude current brand)
  const getRelatedBrands = () => {
    return brandHubs
      .filter(b => !brand || !b.href.includes(brand.toLowerCase()))
      .slice(0, 5);
  };

  if (type === 'location') {
    const relatedLocations = getRelatedLocations();
    const relatedResources = resourceLinks.slice(0, 3);

    return (
      <section className="bg-slate-50 py-12 mt-12 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Equipment in Other Regions
          </h2>
          <p className="text-slate-600 mb-8">
            Flat Earth Equipment serves contractors and fleet operators across the Western U.S. 
            Find parts and rentals in these service areas:
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Other Service Areas */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>📍</span> Nearby Service Areas
              </h3>
              <ul className="space-y-2">
                {relatedLocations.map((area) => (
                  <li key={area.href}>
                    <Link 
                      href={area.href}
                      className="text-canyon-rust hover:underline font-medium"
                    >
                      {area.name} Equipment Parts →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>🔧</span> Resources & Tools
              </h3>
              <ul className="space-y-2">
                {relatedResources.map((resource) => (
                  <li key={resource.href}>
                    <Link 
                      href={resource.href}
                      className="text-canyon-rust hover:underline font-medium flex items-center gap-2"
                    >
                      <span>{resource.icon}</span> {resource.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link 
                    href="/locations"
                    className="text-canyon-rust hover:underline font-medium flex items-center gap-2"
                  >
                    <span>🗺️</span> All Service Locations
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Parts page related resources
  const relatedEquipment = getRelatedEquipment();
  const relatedBrands = getRelatedBrands();

  return (
    <section className="bg-slate-50 py-12 mt-12 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Related Resources
        </h2>
        <p className="text-slate-600 mb-8">
          Explore more parts, equipment guides, and service options from Flat Earth Equipment.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Equipment Categories */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span>🏗️</span> Equipment Categories
            </h3>
            <ul className="space-y-2">
              {relatedEquipment.map((cat) => (
                <li key={cat.href}>
                  <Link 
                    href={cat.href}
                    className="text-canyon-rust hover:underline font-medium flex items-center gap-2"
                  >
                    <span>{cat.icon}</span> {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brand Hubs */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span>🏷️</span> Brand Hubs
            </h3>
            <ul className="space-y-2">
              {relatedBrands.map((b) => (
                <li key={b.href}>
                  <Link 
                    href={b.href}
                    className="text-canyon-rust hover:underline font-medium"
                  >
                    {b.name} Equipment →
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools & Support */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span>🔧</span> Tools & Support
            </h3>
            <ul className="space-y-2">
              {resourceLinks.map((resource) => (
                <li key={resource.href}>
                  <Link 
                    href={resource.href}
                    className="text-canyon-rust hover:underline font-medium flex items-center gap-2"
                  >
                    <span>{resource.icon}</span> {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

