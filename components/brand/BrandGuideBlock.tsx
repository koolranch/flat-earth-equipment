import { BrandGuideMDX, hasBrandGuide } from '@/lib/brandGuides';

export default function BrandGuideBlock({ slug, name }: { slug: string; name: string }){
  const exists = hasBrandGuide(slug);
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-2">{name} Service & Serial Number Guide</h2>
      <p className="text-sm text-muted-foreground mb-3">Practical reference covering serial plate locations, decoding basics, and troubleshooting tips. Always confirm with official procedures.</p>
      <div className="prose prose-sm max-w-none">
        <BrandGuideMDX slug={slug} />
      </div>
    </section>
  );
}
