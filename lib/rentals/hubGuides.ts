export type RentalHubKey =
  | 'scissor-lift'
  | 'boom-lift'
  | 'telehandler'
  | 'skid-steer'
  | 'compact-utility-loader'
  | 'forklift'
  | 'attachments';

export type HubPartsLink = {
  label: string;
  href: string;
  description: string;
};

export type HubFaq = { question: string; answer: string };

export type RentalHubGuide = {
  heading: string;
  intro: string;
  checklistHeading: string;
  checklist: { title: string; body: string }[];
  partsHeading: string;
  partsIntro: string;
  parts: HubPartsLink[];
  /** Only the forklift hub promotes forklift certification. */
  showForkliftTraining: boolean;
  faqs: HubFaq[];
};

export type RentalSummaryRow = {
  brand: string | null;
  lift_height_ft: number | null;
  weight_capacity_lbs: number | null;
  power_source: string | null;
};

export type RentalSummary = {
  modelCount: number;
  brands: string[];
  heightRange: [number, number] | null;
  capacityRange: [number, number] | null;
  powerSources: string[];
};

const PRICE_FAQ: HubFaq = {
  question: 'How do I get a rental price?',
  answer:
    'Rates are not listed on this page. Send the machine, the dates, and the job location through the quote form, and the rate comes back on the quote.',
};

function partsFaq(equipment: string, brandsHint: string): HubFaq {
  return {
    question: `Do you sell parts for ${equipment}?`,
    answer: `Yes. We sell aftermarket replacement parts online for ${brandsHint}. Search by part number or browse by brand above. Freight is calculated at checkout.`,
  };
}

const GUIDES: Record<RentalHubKey, RentalHubGuide> = {
  'scissor-lift': {
    heading: 'Renting a scissor lift: what to check before you request a quote',
    intro:
      'A scissor lift raises a flat work platform straight up, which makes it a fit for ceilings, lighting, signage, racking, and other work on firm, level ground. Pick the size on working height, platform capacity, and how the machine will get to the work.',
    checklistHeading: 'What to check',
    checklist: [
      {
        title: 'Working height',
        body: 'The listed height is how high the platform goes. Add roughly 6 ft for how high an average worker can reach from it.',
      },
      {
        title: 'Capacity',
        body: 'Add up the people, tools, and materials that will be on the platform and compare that to the listed capacity.',
      },
      {
        title: 'Ground and floor',
        body: 'Scissor lifts want a firm, level surface. Tell us if the work is indoors on a slab or outside on dirt or gravel.',
      },
      {
        title: 'Doors and access',
        body: 'Note the narrowest doorway or aisle on the route so the model can be matched to it.',
      },
      {
        title: 'Operator training',
        body: 'People running an aerial work platform need training on that equipment. Confirm your crew has it before the job.',
      },
    ],
    partsHeading: 'Own a scissor lift? Parts we sell',
    partsIntro:
      'Replacement parts for Genie, JLG, and Skyjack scissor lifts ship across the US.',
    parts: [
      {
        label: 'Rough-terrain scissor lift parts',
        href: '/rough-terrain-scissor-parts',
        description: 'Replacement parts by model',
      },
      {
        label: 'Genie scissor lift error codes',
        href: '/parts/aerial-equipment/genie-scissor-lift-error-codes',
        description: 'Diagnose a fault code, then find the part',
      },
      { label: 'Genie parts', href: '/parts?brand=Genie', description: 'Browse the Genie catalog' },
      { label: 'JLG parts', href: '/parts?brand=JLG', description: 'Browse the JLG catalog' },
      { label: 'Skyjack parts', href: '/parts?brand=Skyjack', description: 'Browse the Skyjack catalog' },
    ],
    showForkliftTraining: false,
    faqs: [
      PRICE_FAQ,
      {
        question: 'Will a scissor lift fit through my doorway?',
        answer:
          'Stowed width and height vary by model. Include the narrowest opening in your quote request so the model can be matched to it.',
      },
      partsFaq('scissor lifts', 'Genie, JLG, and Skyjack'),
    ],
  },
  'boom-lift': {
    heading: 'Renting a boom lift: what to check before you request a quote',
    intro:
      'A boom lift reaches up and out, which is the point when the work is over an obstacle or off to the side of where the machine can sit. Size it on working height, outreach, and the ground it has to travel over.',
    checklistHeading: 'What to check',
    checklist: [
      {
        title: 'Height and outreach',
        body: 'Know how high you need to go and how far out from the base the work is. The two are not the same number.',
      },
      {
        title: 'Straight or articulating',
        body: 'A telescopic boom gives straight-line reach. An articulating boom bends to get up and over an obstacle. Describe what is in the way.',
      },
      {
        title: 'Terrain',
        body: 'Tell us whether the machine will sit on pavement, packed ground, or soft or sloped ground.',
      },
      {
        title: 'Capacity',
        body: 'Compare the listed platform capacity to the people and tools that will be in the basket.',
      },
      {
        title: 'Operator training',
        body: 'People running an aerial work platform need training on that equipment. Confirm your crew has it before the job.',
      },
    ],
    partsHeading: 'Own a boom lift? Parts we sell',
    partsIntro: 'Replacement parts for the aerial brands on this page ship across the US.',
    parts: [
      { label: 'Genie parts', href: '/parts?brand=Genie', description: 'Browse the Genie catalog' },
      { label: 'JLG parts', href: '/parts?brand=JLG', description: 'Browse the JLG catalog' },
      { label: 'Skyjack parts', href: '/parts?brand=Skyjack', description: 'Browse the Skyjack catalog' },
      {
        label: 'Rough-terrain scissor lift parts',
        href: '/rough-terrain-scissor-parts',
        description: 'Replacement parts by model',
      },
    ],
    showForkliftTraining: false,
    faqs: [
      PRICE_FAQ,
      {
        question: 'How do I know how much height and reach I need?',
        answer:
          'Measure the height of the work and how far out from where the machine can sit it is. Send both numbers in your quote request.',
      },
      partsFaq('boom lifts', 'Genie, JLG, and Skyjack'),
    ],
  },
  telehandler: {
    heading: 'Renting a telehandler: what to check before you request a quote',
    intro:
      'A telehandler lifts and places loads up and out with a boom, and it works on rougher ground than a standard forklift. Size it on how heavy the load is, how high it goes, and how far out it has to reach.',
    checklistHeading: 'What to check',
    checklist: [
      {
        title: 'Load and reach together',
        body: 'The rated capacity drops as the boom extends or rises. Give us the weight of the load, how high it goes, and how far out it sits.',
      },
      {
        title: 'Attachments',
        body: 'Forks, buckets, work platforms, and other attachments change what the machine can do. Say what you plan to use.',
      },
      {
        title: 'Terrain and access',
        body: 'Describe the ground (packed, soft, sloped) and the narrowest gate or opening on the way in.',
      },
      {
        title: 'Operator training',
        body: 'People running a telehandler need training on that equipment. Confirm your operators have it before the job.',
      },
    ],
    partsHeading: 'Own a telehandler? Parts we sell',
    partsIntro:
      'We sell aftermarket parts for JCB, Genie, and JLG telehandlers, plus cab glass and seats.',
    parts: [
      { label: 'JCB parts', href: '/brand/jcb', description: 'Browse the JCB catalog' },
      {
        label: 'JCB telehandler battery location',
        href: '/rental/telehandler/jcb-telehandler-battery-location',
        description: 'Where to find the battery, with parts links',
      },
      { label: 'Genie parts', href: '/parts?brand=Genie', description: 'Browse the Genie catalog' },
      { label: 'JLG parts', href: '/parts?brand=JLG', description: 'Browse the JLG catalog' },
      { label: 'Cab glass', href: '/cab-glass', description: 'Cab glass by model' },
      { label: 'Seats', href: '/parts?category_slug=seats', description: 'Replacement operator seats' },
    ],
    showForkliftTraining: false,
    faqs: [
      PRICE_FAQ,
      {
        question: 'How do I pick the right size?',
        answer:
          'Start with the heaviest load, the height it has to reach, and how far out from the machine it sits. Send all three in your quote request.',
      },
      partsFaq('telehandlers', 'JCB, Genie, and JLG'),
    ],
  },
  'skid-steer': {
    heading: 'Renting a skid steer: what to check before you request a quote',
    intro:
      'A skid steer is the general-purpose machine for moving material, grading, and swapping attachments. The main choices are wheels or tracks, size, and the attachments you need.',
    checklistHeading: 'What to check',
    checklist: [
      {
        title: 'Wheels or tracks',
        body: 'Wheels are quick on hard, firm surfaces. Tracks grip better and sit lighter on soft or muddy ground.',
      },
      {
        title: 'Size and access',
        body: 'Note the narrowest gate or opening, and the tightest turn on site.',
      },
      {
        title: 'Attachments',
        body: 'Buckets, forks, augers, and other tools change the job. Some need high-flow auxiliary hydraulics, so say what you plan to run.',
      },
      {
        title: 'Job and material',
        body: 'Tell us whether you are moving dirt, gravel, pallets, or debris so the machine can be sized to the load.',
      },
    ],
    partsHeading: 'Own a skid steer? Parts we sell',
    partsIntro: 'Aftermarket parts and rubber tracks for the brands on this page ship across the US.',
    parts: [
      { label: 'Rubber tracks', href: '/rubber-tracks', description: 'Free shipping and a 2-year warranty' },
      { label: 'Bobcat parts', href: '/parts?brand=Bobcat', description: 'Browse the Bobcat catalog' },
      { label: 'Bobcat serial number lookup', href: '/bobcat-serial-number-lookup', description: 'Find your model and plate location' },
      { label: 'Case parts', href: '/parts?brand=Case', description: 'Browse the Case catalog' },
      { label: 'Takeuchi parts', href: '/parts?brand=Takeuchi', description: 'Browse the Takeuchi catalog' },
      { label: 'Seats', href: '/parts?category_slug=seats', description: 'Replacement operator seats' },
    ],
    showForkliftTraining: false,
    faqs: [
      PRICE_FAQ,
      {
        question: 'Wheeled or tracked: which should I ask for?',
        answer:
          'Firm, dry ground suits wheels. Soft, muddy, or uneven ground suits tracks. Describe the ground in your quote request.',
      },
      partsFaq('skid steers', 'Bobcat, Case, Takeuchi, and Caterpillar'),
    ],
  },
  'compact-utility-loader': {
    heading: 'Renting a compact utility loader: what to check before you request a quote',
    intro:
      'A compact utility loader is a small machine, usually on tracks, that gets into places a skid steer cannot, such as backyards, interior spaces, and narrow gates. Pick it on width, capacity, and the attachment you need.',
    checklistHeading: 'What to check',
    checklist: [
      {
        title: 'Width',
        body: 'Measure the narrowest gate or door on the route. Machine widths vary by model.',
      },
      {
        title: 'Capacity',
        body: 'These machines carry much less than a full-size skid steer. Compare the listed capacity to the loads you plan to move.',
      },
      {
        title: 'Attachments',
        body: 'Buckets, augers, trenchers, and other tools are common. Say what you plan to use.',
      },
      {
        title: 'Ground',
        body: 'Tracks work on turf and soft ground, but tell us about slopes and wet conditions.',
      },
    ],
    partsHeading: 'Own a compact loader? Parts we sell',
    partsIntro: 'Aftermarket parts for Bobcat and other brands ship across the US.',
    parts: [
      { label: 'Bobcat parts', href: '/parts?brand=Bobcat', description: 'Browse the Bobcat catalog' },
      { label: 'Bobcat serial number lookup', href: '/bobcat-serial-number-lookup', description: 'Find your model and plate location' },
      { label: 'Rubber tracks', href: '/rubber-tracks', description: 'Free shipping and a 2-year warranty' },
      { label: 'All parts', href: '/parts', description: 'Search by part number' },
    ],
    showForkliftTraining: false,
    faqs: [
      PRICE_FAQ,
      {
        question: 'Will a compact loader fit through my gate?',
        answer:
          'Widths vary by model. Include the narrowest opening in your quote request so the model can be matched to it.',
      },
      partsFaq('compact loaders', 'Bobcat and other brands'),
    ],
  },
  forklift: {
    heading: 'Renting a forklift: what to check before you request a quote',
    intro:
      'A forklift is sized by lift capacity, mast height, and where it will run. The power type depends on whether the work is indoors, outdoors, or both.',
    checklistHeading: 'What to check',
    checklist: [
      {
        title: 'Capacity',
        body: 'Use the weight of your heaviest load. Rated capacity is stated at a set load center, so tell us how long and wide the load is.',
      },
      {
        title: 'Mast height',
        body: 'Know the height you need to lift to, including any racking.',
      },
      {
        title: 'Electric or LPG',
        body: 'Electric machines are common indoors. LPG machines suit mixed indoor and outdoor work. Say where it will run.',
      },
      {
        title: 'Floor and tires',
        body: 'Tell us whether the surface is a smooth slab, pavement, or rough ground.',
      },
      {
        title: 'Operator certification',
        body: 'OSHA requires forklift operators to be trained and evaluated. Complete the classroom portion online or in the app before the machine arrives.',
      },
    ],
    partsHeading: 'Own a forklift? Parts we sell',
    partsIntro:
      'Forks, seats, lithium batteries, chargers, and parts for the brands on this page ship across the US.',
    parts: [
      { label: 'Forklift forks', href: '/forks', description: 'Class II to IV, ITA hook-type' },
      { label: 'Lithium batteries', href: '/lithium-batteries', description: 'Drop-in LiFePO4 kits' },
      { label: 'Battery chargers', href: '/battery-chargers', description: 'By voltage and amperage' },
      { label: 'Charger modules', href: '/charger-modules', description: 'Repair and exchange options' },
      { label: 'Seats', href: '/parts?category_slug=seats', description: 'Replacement operator seats' },
      { label: 'Toyota forklift serial lookup', href: '/toyota-forklift-serial-lookup', description: 'Identify your model' },
      { label: 'Hyster parts', href: '/parts?brand=Hyster', description: 'Browse the Hyster catalog' },
      { label: 'Yale parts', href: '/parts?brand=Yale', description: 'Browse the Yale catalog' },
    ],
    showForkliftTraining: true,
    faqs: [
      PRICE_FAQ,
      {
        question: 'Do my operators need certification?',
        answer:
          'OSHA requires forklift operators to be trained and evaluated. Our online and in-app course covers the classroom portion and ends with a QR-verifiable certificate. The hands-on evaluation on the machine is done by your employer.',
      },
      partsFaq('forklifts', 'Hyster, Yale, Toyota, Crown, and Caterpillar'),
    ],
  },
  attachments: {
    heading: 'Renting attachments: what to check before you request a quote',
    intro:
      'An attachment only works if it fits the machine and the hydraulics behind it. Match the mounting style first, then the size.',
    checklistHeading: 'What to check',
    checklist: [
      {
        title: 'Mounting style',
        body: 'Skid steers use quick-attach plates. Forklifts use hook-type or shaft-mounted forks. Say which machine the attachment goes on.',
      },
      {
        title: 'Size and capacity',
        body: 'Match the width, length, and rated capacity to the machine and the load.',
      },
      {
        title: 'Hydraulics',
        body: 'Augers and other powered tools need auxiliary hydraulics. Tell us the machine and its flow.',
      },
    ],
    partsHeading: 'Need to buy instead? Parts we sell',
    partsIntro: 'We sell forks and fork parts outright, and replacement parts for the machines these attach to.',
    parts: [
      { label: 'Forklift forks', href: '/forks', description: 'Class II to IV, ITA hook-type' },
      { label: 'Rubber tracks', href: '/rubber-tracks', description: 'Free shipping and a 2-year warranty' },
      { label: 'All parts', href: '/parts', description: 'Search by part number' },
    ],
    showForkliftTraining: false,
    faqs: [
      PRICE_FAQ,
      {
        question: 'How do I know an attachment fits my machine?',
        answer:
          'Send the make and model of the machine in your quote request, and say what job the attachment is for.',
      },
    ],
  },
};

const GENERIC_GUIDE: RentalHubGuide = {
  heading: 'Renting this equipment: what to know before you request a quote',
  intro:
    'Tell us the machine, the dates, and the job location, and the rate comes back on the quote.',
  checklistHeading: 'What to include',
  checklist: [
    { title: 'The machine', body: 'The type, size, and any attachments you need.' },
    { title: 'The job', body: 'Where it is, what the ground is like, and how the machine will get there.' },
    { title: 'The dates', body: 'When you need it and for how long.' },
  ],
  partsHeading: 'Parts we sell',
  partsIntro: 'Aftermarket replacement parts ship across the US.',
  parts: [{ label: 'All parts', href: '/parts', description: 'Search by part number' }],
  showForkliftTraining: false,
  faqs: [PRICE_FAQ],
};

/** Match a category name or slug (singular, plural, legacy) to a guide key. */
export function getRentalHubKey(category: string): RentalHubKey | null {
  const lower = category.toLowerCase();
  if (lower.includes('scissor')) return 'scissor-lift';
  if (lower.includes('boom')) return 'boom-lift';
  if (lower.includes('telehandler')) return 'telehandler';
  if (lower.includes('compact') || lower.includes('mini skid')) return 'compact-utility-loader';
  if (lower.includes('skid')) return 'skid-steer';
  if (lower.includes('forklift')) return 'forklift';
  if (lower.includes('attachment')) return 'attachments';
  return null;
}

export function getRentalHubGuide(category: string): RentalHubGuide {
  const key = getRentalHubKey(category);
  return key ? GUIDES[key] : GENERIC_GUIDE;
}

function numericRange(values: (number | null)[]): [number, number] | null {
  const nums = values.filter((v): v is number => typeof v === 'number');
  if (nums.length === 0) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

export function summarizeRentals(rows: RentalSummaryRow[]): RentalSummary {
  const brands = Array.from(
    new Set(rows.map((r) => r.brand).filter((b): b is string => Boolean(b))),
  ).sort();
  const powerSources = Array.from(
    new Set(rows.map((r) => r.power_source).filter((p): p is string => Boolean(p))),
  ).sort();
  return {
    modelCount: rows.length,
    brands,
    heightRange: numericRange(rows.map((r) => r.lift_height_ft)),
    capacityRange: numericRange(rows.map((r) => r.weight_capacity_lbs)),
    powerSources,
  };
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function rangePhrase(
  labels: { range: string; single: string },
  range: [number, number],
  unit: string,
): string {
  const [min, max] = range;
  const fmt = (n: number) => n.toLocaleString('en-US');
  return min === max
    ? `${labels.single} ${fmt(min)} ${unit}.`
    : `${labels.range} from ${fmt(min)} to ${fmt(max)} ${unit}.`;
}

/** One data-driven sentence built from the models actually listed on the hub. */
export function describeRentalSummary(summary: RentalSummary, key: RentalHubKey | null): string | null {
  if (summary.modelCount === 0) return null;

  // Attachment rows carry the attachment type in the brand column.
  if (key === 'attachments') {
    const noun = summary.modelCount === 1 ? '1 attachment' : `${summary.modelCount} attachments`;
    return summary.brands.length > 0
      ? `This page lists ${noun}: ${joinList(summary.brands)}.`
      : `This page lists ${noun}.`;
  }

  const parts: string[] = [];
  const models = summary.modelCount === 1 ? '1 model' : `${summary.modelCount} models`;
  parts.push(
    summary.brands.length > 0
      ? `This page lists ${models} from ${joinList(summary.brands)}.`
      : `This page lists ${models}.`,
  );

  // Skid steer weights are mixed (operating weight vs. rated load), so only
  // describe ranges where the figure means the same thing across the category.
  const showCapacity = key !== 'skid-steer';
  if (summary.heightRange) {
    parts.push(rangePhrase(
      { range: 'Listed lift heights run', single: 'Listed lift height is' },
      summary.heightRange,
      'ft',
    ));
  }
  if (summary.capacityRange && showCapacity) {
    parts.push(rangePhrase(
      { range: 'Listed capacities run', single: 'Listed capacity is' },
      summary.capacityRange,
      'lb',
    ));
  }
  if (summary.powerSources.length > 0) {
    parts.push(`Power: ${joinList(summary.powerSources)}.`);
  }
  return parts.join(' ');
}
