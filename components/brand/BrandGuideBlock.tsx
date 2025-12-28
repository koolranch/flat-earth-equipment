import { MDXRemote } from 'next-mdx-remote/rsc';
import { getBrandGuide, hasBrandGuide } from '@/lib/brandGuides';
import BrandFaqJsonLd from '@/components/seo/BrandFaqJsonLd';
import HowToRetrievalJsonLd from '@/components/seo/HowToRetrievalJsonLd';

export default function BrandGuideBlock({ slug, name }: { slug: string; name: string }){
  const guide = getBrandGuide(slug);
  if (!guide) return null;
  
  // Extract FAQ items from MDX content (simple Q:/A: pattern)
  const faqItems = extractFaqItems(guide.content);
  
  // Extract how-to steps for retrieving fault codes
  const retrievalSteps = extractRetrievalSteps(guide.content);
  
  const url = `https://flatearthequipment.com/brand/${slug}/guide`;
  
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-2">{name} Service & Serial Number Guide</h2>
      <p className="text-sm text-muted-foreground mb-3">Practical reference covering serial plate locations, decoding basics, and troubleshooting tips. Always confirm with official procedures.</p>
      <div className="prose prose-sm max-w-none">
        <MDXRemote source={guide.content} />
      </div>
      
      {/* JSON-LD Structured Data */}
      {faqItems.length > 0 && <BrandFaqJsonLd faqs={faqItems} url={url} />}
      {retrievalSteps.length > 0 && <HowToRetrievalJsonLd brand={name} steps={retrievalSteps} url={url} />}
    </section>
  );
}

function extractFaqItems(content: string): { q: string; a: string }[] {
  const lines = content.split(/\r?\n/);
  const items: { q: string; a: string }[] = [];
  let currentQ: string | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Q:')) {
      currentQ = trimmed.replace(/^Q:\s*/, '');
    } else if (trimmed.startsWith('A:') && currentQ) {
      items.push({ 
        q: currentQ, 
        a: trimmed.replace(/^A:\s*/, '') 
      });
      currentQ = null;
    }
  }
  
  return items;
}

function extractRetrievalSteps(content: string): string[] {
  // Look for "Fault Workflow" or "Quick Fault Workflow" sections with numbered steps
  const lines = content.split(/\r?\n/);
  const steps: string[] = [];
  let inWorkflowSection = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().includes('fault workflow')) {
      inWorkflowSection = true;
      continue;
    }
    if (inWorkflowSection && trimmed.match(/^\d+\./)) {
      steps.push(trimmed.replace(/^\d+\.\s*/, ''));
    }
    if (inWorkflowSection && trimmed.startsWith('###') && !trimmed.toLowerCase().includes('fault')) {
      inWorkflowSection = false;
    }
  }
  
  return steps;
}
