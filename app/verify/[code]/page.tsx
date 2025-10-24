import type { Metadata } from 'next';
import { headers } from 'next/headers';
import VerifyClient from './VerifyClient';

export const dynamic = 'force-dynamic';

async function fetchVerification(code: string) {
  // Build absolute URL on server to avoid SSR fetch errors
  const envBase = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  let apiUrl = '';
  if (envBase) {
    apiUrl = `${envBase}/api/verify/${code}`;
  } else {
    const h = headers();
    const proto = h.get('x-forwarded-proto') || 'https';
    const host = h.get('x-forwarded-host') || h.get('host') || '';
    apiUrl = host ? `${proto}://${host}/api/verify/${code}` : `/api/verify/${code}`;
  }
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const titleBase = 'Forklift Certification Verification';
  return { title: `${titleBase} · Code ${params.code}` };
}

// CopyButton moved to client file to prevent SSR hydration errors

export default async function VerifyPage({ params }: { params: { code: string } }) {
  // Render purely on client to avoid SSR pitfalls on edge
  return <VerifyClient code={params.code} />;
}