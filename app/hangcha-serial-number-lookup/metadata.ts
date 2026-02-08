import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata = {
  title: 'Hangcha Serial Number Lookup (CPD, CPCD/CPQ, CQD, CBD, CDD, CJD) | Flat Earth Equipment',
  description: 'Find Hangcha (HC) data/ID plate locations by family and capture the correct serial/PIN for parts or service. No year decoding.',
  alternates: generatePageAlternates("/hangcha-serial-number-lookup"),
  openGraph: {
    title: 'Hangcha Serial Number Lookup',
    description: 'Plate locations and serial best practices for Hangcha electric/IC counterbalance, reach, pallet trucks, stackers, and order pickers.',
    url: '/hangcha-serial-number-lookup',
    type: 'website'
  }
};
