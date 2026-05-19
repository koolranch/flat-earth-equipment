import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import SafetyLandingPage from './SafetyLandingPage';
import { generateSafetyMetadata } from './metadata';
import { detectSafetyTrafficSource, type SafetySearchParams } from '@/lib/safety/traffic-source';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  return generateSafetyMetadata('en', searchParams);
}

export default async function SafetyPage({
  searchParams,
}: {
  searchParams?: SafetySearchParams;
}) {
  const cookieStore = cookies();
  const trafficSource = detectSafetyTrafficSource({
    searchParams,
    cookies: {
      _gcl_aw: cookieStore.get('_gcl_aw')?.value,
    },
  });

  return <SafetyLandingPage locale="en" trafficSource={trafficSource} />;
}
