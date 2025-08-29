'use client';
import PPESequence from '@/components/demos/PPESequence';

interface Props {
  onComplete?: () => void;
  openGuide?: () => void;
  locale?: 'en' | 'es';
  moduleSlug?: string;
}

export default function MiniPPE({ onComplete, openGuide, locale = 'en', moduleSlug }: Props) {
  return <PPESequence locale={locale} moduleSlug={moduleSlug} />;
} 