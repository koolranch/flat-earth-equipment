import type { Metadata } from 'next';
const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com';
const cdn = (process.env.NEXT_PUBLIC_SUPABASE_URL || '') + '/storage/v1/object/public/' + (process.env.NEXT_PUBLIC_ASSET_BUCKET || 'public-assets');
export const seoDefaults: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: 'Forklift Certification — Flat Earth Equipment',
    template: '%s | Flat Earth Equipment'
  },
  description: 'Modern, interactive forklift operator training and certification — fast, compliant, and no BS.',
  openGraph: {
    type: 'website',
    url: base,
    title: 'Forklift Certification — Flat Earth Equipment',
    description: 'Modern, interactive forklift operator training and certification — fast, compliant, and no BS.',
    images: [{ url: `${cdn}/images/generated/og-default.png`, width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forklift Certification — Flat Earth Equipment',
    description: 'Modern, interactive forklift operator training and certification — fast, compliant, and no BS.',
    images: [`${cdn}/images/generated/og-default.png`]
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [ { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' } ]
  },
  manifest: '/site.webmanifest'
};
