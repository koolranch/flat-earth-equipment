import BrandGuideBlock from '@/components/brand/BrandGuideBlock';
import BrandFAQBlock from '@/components/brand/BrandFAQBlock';
import BrandTabs, { TabContent } from '@/components/brand/BrandTabs';
import FaultSearch from '@/components/faults/FaultSearch';
import SerialLookupEmbed from '@/components/brand/SerialLookupEmbed';
import PartsLeadForm from '@/components/brand/PartsLeadForm';
import { Brand } from '@/lib/brands';

interface BrandHubPageProps {
  brand: Brand;
  defaultTab?: 'serial' | 'fault-codes' | 'parts';
}

export default function BrandHubPage({ brand, defaultTab = 'serial' }: BrandHubPageProps) {
  return (
    <div className="space-y-8">
      {/* Tabs Interface */}
      <BrandTabs 
        brandSlug={brand.slug}
        hasSerialLookup={brand.has_serial_lookup}
        hasFaultCodes={brand.has_fault_codes}
      >
        {/* Serial Lookup Tab */}
        {brand.has_serial_lookup && (
          <TabContent tabId="serial">
            <SerialLookupEmbed 
              brandSlug={brand.slug} 
              brandName={brand.name}
            />
          </TabContent>
        )}

        {/* Fault Codes Tab */}
        {brand.has_fault_codes && (
          <TabContent tabId="fault-codes">
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {brand.name} Fault Code Database
                </h3>
                <p className="text-sm text-muted-foreground">
                  Search our database of common {brand.name} fault codes and diagnostic guidance. 
                  Use these as a starting point - always confirm with official service procedures.
                </p>
              </div>
              <FaultSearch brand={brand.slug} />
            </div>
          </TabContent>
        )}

        {/* Parts Request Tab */}
        <TabContent tabId="parts">
          <PartsLeadForm 
            brandSlug={brand.slug} 
            brandName={brand.name}
          />
        </TabContent>
      </BrandTabs>

      {/* Brand Guide Section */}
      <BrandGuideBlock slug={brand.slug} name={brand.name} />

      {/* Brand FAQ Section */}
      <BrandFAQBlock slug={brand.slug} name={brand.name} url={`https://www.flatearthequipment.com/brand/${brand.slug}`} />
    </div>
  );
}
