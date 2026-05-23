/**
 * High-priority equipment models for future /seats/[brand]/[model] hub pages.
 * Populated from seat guide parse — expand as pricing goes live.
 */
export type SeatModelHub = {
  slug: string;
  brand: string;
  model: string;
  fullName: string;
  popularity: 'High' | 'Medium' | 'Niche';
  primaryAssemblyOem?: string;
  primaryCushionOem?: string;
  intro: string;
};

export const SEAT_MODEL_HUBS: SeatModelHub[] = [
  {
    slug: 'jcb-541-70wm',
    brand: 'JCB',
    model: '541-70WM',
    fullName: 'JCB 541-70WM Loadall',
    popularity: 'High',
    primaryAssemblyOem: 'JC333/D1371',
    intro:
      'The JCB 541-70WM is one of the most common telehandlers in rental and construction fleets. Multiple OEM seat assemblies and back/bottom cushion kits fit this platform — confirm your cab style and seat switch wiring before ordering.',
  },
  {
    slug: 'caterpillar-th336',
    brand: 'Caterpillar',
    model: 'TH336',
    fullName: 'Caterpillar TH336 Telehandler',
    popularity: 'High',
    primaryAssemblyOem: 'CT315-3904',
    intro:
      'Caterpillar TH336 telehandler seats wear from daily cab entry and load cycles. We stock OEM-spec seat assemblies and individual back/bottom cushions for TH336/TH337/TH406/TH407 family machines.',
  },
  {
    slug: 'caterpillar-tl943',
    brand: 'Caterpillar',
    model: 'TL943',
    fullName: 'Caterpillar TL943 Telehandler',
    popularity: 'High',
    primaryAssemblyOem: 'CT298-8722',
    intro:
      'The TL943 and TL943C share a common vinyl seat platform with adjustable suspension on many units. Replacement assemblies and cushion kits restore operator comfort without replacing the entire cab interior.',
  },
  {
    slug: 'jlg-g10-55a',
    brand: 'JLG',
    model: 'G10-55A',
    fullName: 'JLG G10-55A Telehandler',
    popularity: 'High',
    primaryAssemblyOem: 'JL91563158',
    intro:
      'JLG G10-55A and related G-series telehandlers use a shared seat platform with optional ACCUPLACE variants. Match your part number to the OEM label on the seat frame before checkout.',
  },
  {
    slug: 'bobcat-t2250',
    brand: 'Bobcat',
    model: 'T2250',
    fullName: 'Bobcat T2250',
    popularity: 'Medium',
    primaryAssemblyOem: 'BC6919587',
    intro:
      'Bobcat T2250 compact track loaders need durable vinyl seat components for dusty jobsite conditions. Full assemblies and separate back/bottom cushions are available.',
  },
  {
    slug: 'genie-gth-844',
    brand: 'Genie',
    model: 'GTH-844',
    fullName: 'Genie GTH-844 Telehandler',
    popularity: 'Medium',
    primaryAssemblyOem: 'GN123137',
    intro:
      'Genie GTH-844 telehandlers share seat components with several GTH-600/800 series models. Verify your Genie part number against the data plate on the existing seat.',
  },
  {
    slug: 'manitou-mlt-730',
    brand: 'Manitou',
    model: 'MLT 730',
    fullName: 'Manitou MLT 730',
    popularity: 'Medium',
    intro:
      'Manitou MLT 730 telehandlers span multiple production series with different seat switch and adjuster configurations. Send your serial number if you are unsure which OEM seat applies.',
  },
  {
    slug: 'skytrack-8042',
    brand: 'Skytrack',
    model: '8042',
    fullName: 'Skytrack 8042',
    popularity: 'Medium',
    primaryAssemblyOem: 'SA1001101085',
    intro:
      'Skytrack 8042 and related 6036/6042/10042/10054 models use a common JLG-family seat platform. Assemblies include seat adjusters on most listed fitments.',
  },
  {
    slug: 'taylor-dunn-b-210',
    brand: 'Taylor Dunn',
    model: 'B-210',
    fullName: 'Taylor Dunn B-210',
    popularity: 'Medium',
    intro:
      'Taylor Dunn B-210 utility vehicles have multiple cushion shapes depending on cab configuration. Match back vs bottom cushions using the OEM part number from your existing seat.',
  },
  {
    slug: 'tennant-t16',
    brand: 'Tennant',
    model: 'T16',
    fullName: 'Tennant T16 Scrubber',
    popularity: 'Niche',
    intro:
      'Tennant floor scrubber operator seats take constant vibration and chemical exposure. OEM-spec replacements restore ride quality for long shift operation.',
  },
];

export function getSeatModelHub(slug: string): SeatModelHub | undefined {
  return SEAT_MODEL_HUBS.find((h) => h.slug === slug);
}
