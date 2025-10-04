import type { ReactNode } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { requireOrgRoleServer } from '@/lib/orgs/requireOrgRoleServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrainerLayout({ 
  children 
}: { 
  children: ReactNode;
}) {
  noStore();
  
  // Note: We don't enforce authentication here anymore because the main /trainer page
  // now serves as a public landing page. Individual sub-pages that need authentication
  // should handle their own auth requirements.
  
  return <>{children}</>;
}
