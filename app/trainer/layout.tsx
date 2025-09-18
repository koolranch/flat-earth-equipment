import type { ReactNode } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { requireOrgRoleServer } from '@/lib/orgs/requireOrgRoleServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrainerLayout({ children }: { children: ReactNode }) {
  noStore();
  await requireOrgRoleServer(['owner','trainer']); // Only owners/trainers allowed
  return <>{children}</>;
}
