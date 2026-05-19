import type { Metadata } from 'next';
import SafetyLandingPage from './SafetyLandingPage';
import { generateSafetyMetadata } from './metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  return generateSafetyMetadata('en', searchParams);
}

export default async function SafetyPage() {
  return <SafetyLandingPage locale="en" />;
}
