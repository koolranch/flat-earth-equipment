'use client';
import InspectionHotspots from '@/components/demos/InspectionHotspots';

interface Props {
  locale?: 'en' | 'es';
  onComplete?: () => void;
  moduleSlug?: string;
}

export default function MiniInspection({ locale = 'en', onComplete, moduleSlug }: Props) {
  return <InspectionHotspots locale={locale} moduleSlug={moduleSlug} />;
} 