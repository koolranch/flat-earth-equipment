import { getUserAndRole, isTrainerOrAdmin } from '@/lib/auth/roles';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getUserAndRole();
  if (!user || !isTrainerOrAdmin(role)) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-xl font-bold">Access denied</h1>
        <p className="text-sm mt-1">You need trainer or admin access.</p>
        <p className="text-sm mt-2"><Link href="/training" className="underline">Back to training</Link></p>
      </main>
    );
  }
  return <>{children}</>;
}
