import Link from 'next/link';
export default function InlineBrandCTA({ slug, name }: { slug: string; name: string }){
  return (
    <div className="my-6 rounded-xl border p-4 bg-card">
      <div className="font-medium">Need help with {name} parts or diagnostics?</div>
      <p className="text-sm text-muted-foreground">Use our {name} brand hub to run serial lookups, search fault codes, and request the right parts the first time.</p>
      <Link href={`/brand/${slug}`} className="inline-block mt-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90">Open {name} Hub</Link>
    </div>
  );
}
