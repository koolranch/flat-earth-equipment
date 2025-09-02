import { compileMDX } from 'next-mdx-remote/rsc';
import { loadMdxWithFallback } from '@/lib/content/mdx';
import * as Lib from './MDXProvider';
import DemoBlock from './DemoBlock';
import MicroQuiz from './MicroQuiz';

export default async function ContentPage({ slug, locale }:{ slug:string; locale?: 'en'|'es' }){
  const preferred = (locale || (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as any) || 'en') as 'en'|'es';
  const { source, locale:used } = await loadMdxWithFallback(slug, preferred);
  const { content } = await compileMDX({
    source,
    components: {
      h2: (props:any)=> <h2 className="text-xl font-semibold mt-4 mb-2" {...props}>{props.children || ' '}</h2>,
      h3: (props:any)=> <h3 className="text-lg font-semibold mt-3 mb-1" {...props}>{props.children || ' '}</h3>,
      Callout: Lib.Callout,
      Objectives: Lib.Objectives,
      Checklist: Lib.Checklist,
      ResourceLink: Lib.ResourceLink,
      Hr: Lib.Hr,
      DemoBlock,
      MicroQuiz
    }
  });
  return (
    <article data-locale={used} className="prose prose-slate max-w-none">
      {content}
    </article>
  );
}
