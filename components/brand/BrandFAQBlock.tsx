import { MDXRemote } from 'next-mdx-remote/rsc';
import JsonLd from '@/components/seo/JsonLd';
import { getBrandFaq, hasBrandFaq } from '@/lib/brandFaqs';

export default function BrandFAQBlock({ slug, name, url }: { slug: string; name: string; url: string }){
  const faq = getBrandFaq(slug);
  if (!faq) return null;
  const qa = extractQA(faq.content);
  const jsonLd = qa.length ? faqJson(name, url, qa) : null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-2">{name} FAQs</h2>
      <div className="prose prose-sm max-w-none">
        <MDXRemote source={faq.content} />
      </div>
      {jsonLd ? <JsonLd json={jsonLd} /> : null}
    </section>
  );
}

function extractQA(mdx: string){
  // Very simple parse: lines starting with 'Q:' and 'A:' become pairs
  const lines = mdx.split(/\r?\n/);
  const out: { question: string, answer: string }[] = [];
  let q: string | null = null;
  for (const line of lines){
    if (line.trim().startsWith('Q:')) { q = line.replace(/^Q:\s*/, '').trim(); }
    else if (line.trim().startsWith('A:') && q){ out.push({ question: q, answer: line.replace(/^A:\s*/, '').trim() }); q = null; }
  }
  return out;
}

function faqJson(name: string, url: string, qa: {question: string, answer: string}[]){
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': qa.map(({question, answer}) => ({
      '@type': 'Question',
      'name': question,
      'acceptedAnswer': { '@type': 'Answer', 'text': answer }
    })),
    'about': name,
    'url': url
  };
}
