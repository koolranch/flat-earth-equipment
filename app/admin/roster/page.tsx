// app/admin/roster/page.tsx
import 'server-only';
import { cookies } from 'next/headers';
import { fetchRoster } from '@/lib/admin/roster.server';
import AdminRosterTable from '@/components/admin/AdminRosterTable';

export default async function Page({ searchParams }: { searchParams?: Record<string,string> }) {
  const orgId = searchParams?.orgId || '';
  if (!orgId) return <main className='container mx-auto p-4'>Provide ?orgId=...</main>;
  const data = await fetchRoster(orgId);
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  return (<main className='container mx-auto p-4'>
    <h1 className='text-2xl font-bold text-[#0F172A]'>Roster</h1>
    <AdminRosterTable rows={data} orgId={orgId} locale={locale} />
  </main>);
}
