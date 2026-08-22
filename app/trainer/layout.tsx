import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import { requireOrgRoleServer } from '@/lib/orgs/requireOrgRoleServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// On app.getforkliftcertified.com the tab title must say Forklift Certified,
// not the FEE root-layout default. FEE hosts inherit the parent metadata.
export async function generateMetadata(): Promise<Metadata> {
  const host = (headers().get('host') || '').toLowerCase();
  if (host === 'app.getforkliftcertified.com') {
    return {
      title: {
        default: 'Trainer Dashboard | Forklift Certified',
        template: '%s | Forklift Certified',
      },
      description: 'Track training progress and manage seats for your team.',
      robots: { index: false, follow: false },
    };
  }
  return {};
}

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
