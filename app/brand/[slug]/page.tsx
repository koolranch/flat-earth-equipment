import { redirect } from 'next/navigation';

export default function BrandSlugPage({ params }: { params: { slug: string } }) {
  // TEMPORARY: Disable redirect to test if serial-lookup page works independently
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Brand Hub</h1>
        <p className="mb-4">Testing page for {params.slug}</p>
        <a 
          href={`/brand/${params.slug}/serial-lookup`}
          className="text-blue-600 underline hover:no-underline"
        >
          Go to Serial Lookup →
        </a>
      </div>
    </div>
  );
}