'use client';

interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  authorUrl?: string;
  publisherName?: string;
  publisherLogo?: string;
  image?: string;
  keywords?: string[];
}

/**
 * ArticleJsonLd - JSON-LD structured data for blog posts and articles
 * Implements Schema.org Article type for rich results in Google
 * 
 * @example
 * <ArticleJsonLd
 *   title="How to Replace Forklift Forks"
 *   description="Step-by-step guide to replacing worn forklift forks safely."
 *   url="https://www.flatearthequipment.com/insights/replace-forklift-forks"
 *   datePublished="2024-01-15"
 *   image="https://example.com/fork-replacement.jpg"
 * />
 */
export default function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  authorName = 'Flat Earth Equipment',
  authorUrl = 'https://www.flatearthequipment.com/about',
  publisherName = 'Flat Earth Equipment',
  publisherLogo = 'https://www.flatearthequipment.com/logo.png',
  image,
  keywords,
}: ArticleJsonLdProps) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': description,
    'url': url,
    ...(datePublished && { 'datePublished': datePublished }),
    ...(dateModified && { 'dateModified': dateModified }),
    ...(image && {
      'image': {
        '@type': 'ImageObject',
        'url': image,
      },
    }),
    'author': {
      '@type': 'Organization',
      'name': authorName,
      'url': authorUrl,
    },
    'publisher': {
      '@type': 'Organization',
      'name': publisherName,
      'logo': {
        '@type': 'ImageObject',
        'url': publisherLogo,
      },
    },
    ...(keywords?.length && { 'keywords': keywords.join(', ') }),
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
