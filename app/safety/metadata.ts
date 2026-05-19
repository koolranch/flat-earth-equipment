import type { Metadata } from 'next';
import type { Locale } from '@/i18n';
import { getMarketingDict } from '@/i18n';

const CANONICAL = {
  en: 'https://www.flatearthequipment.com/safety',
  es: 'https://www.flatearthequipment.com/es/safety',
} as const;

function hasSearchParam(searchParams?: Record<string, string | string[] | undefined>) {
  return !!searchParams && Object.keys(searchParams).some((key) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== '';
  });
}

export function generateSafetyMetadata(
  locale: Locale,
  searchParams?: Record<string, string | string[] | undefined>,
): Metadata {
  const t = getMarketingDict(locale);
  const canonical = CANONICAL[locale];
  const hasAnyParam = hasSearchParam(searchParams);

  return {
    title: t.safety.metadata.title,
    description: t.safety.metadata.description,
    openGraph: {
      title: t.safety.metadata.ogTitle,
      description: t.safety.metadata.ogDescription,
      type: 'website',
      url: canonical,
      siteName: 'Flat Earth Safety',
      locale: locale === 'es' ? 'es_US' : 'en_US',
      images: [
        {
          url: '/og-forklift-training.jpg',
          width: 1200,
          height: 630,
          alt: t.safety.metadata.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.safety.metadata.title,
      description: t.safety.metadata.twitterDescription,
      images: ['/og-forklift-training.jpg'],
    },
    alternates: {
      canonical,
      languages: {
        en: CANONICAL.en,
        es: CANONICAL.es,
        'x-default': CANONICAL.en,
      },
    },
    robots: hasAnyParam
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}
