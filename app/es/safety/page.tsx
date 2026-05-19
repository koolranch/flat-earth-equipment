import type { Metadata } from 'next';
import SafetyLandingPage from '@/app/safety/SafetyLandingPage';
import { generateSafetyMetadata } from '@/app/safety/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  return generateSafetyMetadata('es', searchParams);
}

export default async function SpanishSafetyPage() {
  return <SafetyLandingPage locale="es" />;
}
