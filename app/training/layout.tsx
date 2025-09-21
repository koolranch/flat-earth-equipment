import React from 'react';
import { ReactNode } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { requireAuthServer } from '@/lib/auth/requireAuthServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrainingLayout({
  children,
}: {
  children: ReactNode;
}) {
  noStore();
  await requireAuthServer('/training'); // redirects anon → /login?next=/training
  return (
    <div className="training-layout" style={{ paddingTop: 'calc(var(--subnav-h,56px) + 0px)' }}>
      {children}
    </div>
  );
}
