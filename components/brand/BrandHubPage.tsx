import BrandGuideBlock from '@/components/brand/BrandGuideBlock';
import BrandFAQBlock from '@/components/brand/BrandFAQBlock';
import BrandHubCTA from '@/components/brand/BrandHubCTA';
import SubmissionForm from '@/components/brand/SubmissionForm';
import CommunityNotes from '@/components/brand/CommunityNotes';
import BrandTabs, { TabContent } from '@/components/brand/BrandTabs';
import FaultSearch from '@/components/faults/FaultSearch';
import SerialLookupEmbed from '@/components/brand/SerialLookupEmbed';

export default function BrandHubPage({ brand, defaultTab }: { brand: { slug: string; name: string }; defaultTab: 'serial'|'fault-codes'|'guide' }) {
  return (
    <div className="space-y-6">
      {/* CTA A/B Test */}
      <BrandHubCTA slug={brand.slug} name={brand.name} />
      
      <BrandTabs brandSlug={brand.slug} hasSerialLookup={true} hasFaultCodes={true}>
        <TabContent tabId="serial">
          <SerialLookupEmbed brandSlug={brand.slug} brandName={brand.name} />
        </TabContent>
        
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
        
        <TabContent tabId="parts">
          <BrandGuideBlock slug={brand.slug} name={brand.name} />
        </TabContent>
      </BrandTabs>
      
      <BrandFAQBlock slug={brand.slug} name={brand.name} url={`https://www.flatearthequipment.com/brand/${brand.slug}`} />
      
      {/* Community Notes */}
      <CommunityNotes brandSlug={brand.slug} />
      
      {/* User Submission Form */}
      <SubmissionForm brand={brand} />
    </div>
  );
}
