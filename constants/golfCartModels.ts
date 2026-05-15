/**
 * Golf cart models we publish dedicated lithium battery landing pages for.
 *
 * Each entry maps a cart-model search query (e.g. "ezgo txt 48v lithium battery")
 * to one or more recommended Lithium Rhino SKUs and cart-specific copy.
 *
 * URL pattern: /lithium-batteries/{slug}
 * Example: /lithium-batteries/ezgo-txt-48v
 */

export type CartModel = {
  slug: string;                         // URL slug (e.g., "ezgo-txt-48v")
  brand: 'EZGO' | 'Club Car' | 'Yamaha';
  model: string;                        // e.g., "TXT 48V"
  fullName: string;                     // e.g., "EZGO TXT 48V"
  yearRange: string;                    // e.g., "1996–Present"
  voltage: '36V' | '48V';
  popularity: 'High' | 'Medium' | 'Niche';
  cartIntro: string;                    // 1-2 paragraphs about this cart and lithium fit

  // Battery recommendations (use FSIP SKUs - matches `parts.sku`)
  recommendedSkus: {
    primary: string;                    // Best overall pick
    budget?: string;                    // Lower-cost option
    extendedRange?: string;             // Higher capacity for range
  };

  installNotes: string[];               // Cart-specific install considerations
  rangeEstimate: string;                // e.g., "35-50 miles per charge"
  faq: Array<{ q: string; a: string }>;
};

export const CART_MODELS: CartModel[] = [
  // ─────────── EZGO ───────────
  {
    slug: 'ezgo-txt-48v',
    brand: 'EZGO',
    model: 'TXT 48V',
    fullName: 'EZGO TXT 48V',
    yearRange: '1996–Present',
    voltage: '48V',
    popularity: 'High',
    cartIntro:
      'The EZGO TXT 48V is the most-converted golf cart in America. Originally designed for 6× 8V flooded lead-acid batteries (296 lb pack), it benefits enormously from a lithium upgrade — losing ~200 lb, gaining 30%+ range, and accelerating noticeably faster on the same DCS or PDS controller. Both the resistor-based DCS (1996–early 2000s) and the modern PDS systems handle LiFePO4 perfectly without controller modification.',
    recommendedSkus: {
      primary: '113-LR51V105AH',          // 48V 105Ah Kit
      budget: '113-LR51V65AH',            // 48V 65Ah Kit
      extendedRange: '113-LR51V120AH',    // 48V 120Ah Kit
    },
    installNotes: [
      'TXT battery tray is sized for 6× T-105 batteries — Lithium Rhino kits include adapter brackets to mount the smaller lithium pack securely.',
      'PDS-equipped TXTs (2010+) can use the lithium charger out-of-the-box; older DCS carts may need to verify the charger is compatible with your existing receptacle (PowerWise vs Crowsfoot vs SB50).',
      'TXT carts running an aftermarket controller (Alltrax, Navitas, etc.) will see even bigger range and acceleration gains from lithium.',
      'Remove the 12V accessory tap from the original wiring and use the included DC-to-DC converter — TXT lights and Onward gauges run on 12V.',
    ],
    rangeEstimate: '35–50 miles per charge with the 48V 105Ah kit',
    faq: [
      {
        q: 'Will a Lithium Rhino battery work in my TXT?',
        a: 'Yes. The 48V 105Ah Conversion Kit is specifically dimensioned for the TXT battery tray and includes the correct charger and DC-to-DC converter. Both DCS (1996–2009) and PDS (2010–present) controllers are fully lithium-compatible.',
      },
      {
        q: 'Do I need to upgrade my motor or controller?',
        a: 'No. The stock motor and controller work fine with lithium. Many TXT owners report better motor performance and less heat because lithium voltage stays high under load (lead-acid sags significantly).',
      },
      {
        q: 'How much faster will my TXT be?',
        a: 'Acceleration improves noticeably (~10-15%) due to the 200 lb weight reduction and more stable voltage. Top speed stays the same unless you upgrade the controller separately.',
      },
      {
        q: 'Can I keep my old PowerWise charger?',
        a: 'No. Lead-acid chargers will damage a lithium pack. The conversion kit includes a LiFePO4-rated charger with the matching receptacle for your year TXT.',
      },
    ],
  },
  {
    slug: 'ezgo-txt-36v',
    brand: 'EZGO',
    model: 'TXT 36V',
    fullName: 'EZGO TXT 36V',
    yearRange: '1996–2009',
    voltage: '36V',
    popularity: 'Medium',
    cartIntro:
      'The 36V EZGO TXT was sold alongside the 48V version through the late 2000s and remains common in older fleets. While most owners eventually convert to 48V for more power, a 36V lithium upgrade is the lowest-cost path to dramatically extend an older cart\'s life — perfect for a property cart or backup vehicle.',
    recommendedSkus: {
      primary: '113-LR38V105AH',          // 36V 105Ah Kit
      budget: '113-LR38V65AH',            // 36V 65Ah Kit
    },
    installNotes: [
      '36V TXTs use 6× 6V lead-acid batteries originally — the lithium kit consolidates to a single battery with adapter brackets included.',
      'Voltage stays exactly 36V (38.4V nominal for LiFePO4 maps well to lead-acid 36V) — no controller changes needed.',
      'If you plan to convert to 48V later, you\'ll need a new motor/controller — sticking with 36V lithium is the cheaper, quicker upgrade.',
    ],
    rangeEstimate: '25–40 miles per charge with the 36V 105Ah kit',
    faq: [
      {
        q: 'Should I upgrade to 48V instead of staying with 36V lithium?',
        a: 'Only if you want significantly more speed and torque. A 36V lithium upgrade costs about half of a full 48V conversion (which requires new motor + controller + batteries) and still doubles your range.',
      },
      {
        q: 'Will a 36V kit work on my 1995 TXT?',
        a: 'Yes — the kit fits 36V TXTs from 1994 through 2009. The mounting hardware accommodates the older battery tray dimensions.',
      },
    ],
  },
  {
    slug: 'ezgo-rxv-48v',
    brand: 'EZGO',
    model: 'RXV 48V',
    fullName: 'EZGO RXV 48V',
    yearRange: '2008–Present',
    voltage: '48V',
    popularity: 'High',
    cartIntro:
      'The EZGO RXV uses an AC drive system that benefits more from lithium than nearly any other golf cart. The high-efficiency AC motor draws less current at higher voltages, and lithium\'s rock-steady voltage (vs lead-acid sag) means the RXV stays in its optimal efficiency band throughout the discharge curve. Owners regularly report 40%+ range improvements after switching.',
    recommendedSkus: {
      primary: '113-LR51V105AH',          // 48V 105Ah Kit
      extendedRange: '113-LR51V120AH',    // 48V 120Ah Kit
    },
    installNotes: [
      'RXV uses 4× 12V lead-acid batteries (not 6× 8V like TXT) — the lithium kit replaces all 4 with one unit.',
      'The RXV\'s factory charger is the Delta-Q QuiQ which is NOT lithium-compatible — replace with the LiFePO4 charger included in the kit.',
      'The RXV onboard computer reads pack voltage; lithium stays at higher voltage longer, so the dash-mounted state-of-charge meter will read more accurately throughout the day.',
      'Original RXV Lester chargers are also lead-acid only — do not reuse.',
    ],
    rangeEstimate: '40–55 miles per charge with the 48V 105Ah kit',
    faq: [
      {
        q: 'Is the RXV harder to convert than the TXT?',
        a: 'Slightly different (4 batteries instead of 6) but not harder. The RXV bench is usually cleaner because newer carts have less battery-acid corrosion.',
      },
      {
        q: 'Will lithium fix my dying RXV batteries?',
        a: 'Lithium will replace your dying lead-acid pack entirely. If your RXV has other issues (weak controller, motor issues, brake noise), those are separate — but a new lithium pack often makes a tired-feeling RXV feel like a new cart again.',
      },
      {
        q: 'Will the RXV onboard charger work?',
        a: 'No. The factory Delta-Q charger is programmed for lead-acid voltage curves. The Lithium Rhino kit includes a properly-programmed LiFePO4 charger.',
      },
    ],
  },

  // ─────────── Club Car ───────────
  {
    slug: 'club-car-precedent-48v',
    brand: 'Club Car',
    model: 'Precedent 48V',
    fullName: 'Club Car Precedent 48V',
    yearRange: '2004–Present',
    voltage: '48V',
    popularity: 'High',
    cartIntro:
      'The Club Car Precedent is one of the most popular fleet carts in America — found at golf courses, resorts, and gated communities nationwide. The aluminum frame keeps base weight low, and the 48V system handles lithium beautifully. Both the IQ (Solid State) and the older Excel controllers work without modification.',
    recommendedSkus: {
      primary: '113-LR51V105AH',
      budget: '113-LR51V65AH',
      extendedRange: '113-LR51V120AH',
    },
    installNotes: [
      'The Precedent uses 6× 8V batteries originally — Lithium Rhino kits include the proper adapter mounts for the Precedent battery tray dimensions.',
      'Both IQ controllers (2008+) and Excel (2004–2007) are fully compatible with lithium voltage curves.',
      'Precedent OBC (Onboard Computer) reads voltage for diagnostics — lithium\'s higher steady-state voltage will not cause OBC errors but may affect the older fuel-gauge LED display reading.',
      'If your Precedent has the optional headlight/taillight package, the lithium kit\'s included 48V-to-12V DC converter handles all 12V accessories.',
    ],
    rangeEstimate: '40–50 miles per charge with the 48V 105Ah kit',
    faq: [
      {
        q: 'Will lithium work on my fleet Precedent (no fancy options)?',
        a: 'Yes. The base Precedent fleet model is one of the easiest conversions — fewer accessories means fewer wiring touchpoints.',
      },
      {
        q: 'My Precedent has a lift kit — does that change anything?',
        a: 'A lift kit makes lithium even more attractive: the 200 lb weight reduction offsets the heavier 22"+ tires that lifts typically use. Acceleration and hill climbing improve significantly on lifted Precedents.',
      },
      {
        q: 'Will the OBC throw errors with a lithium pack?',
        a: 'Generally no. The Precedent OBC reads pack voltage for diagnostics, not for charge management. Lithium\'s higher voltage stays within the OBC\'s expected range throughout discharge.',
      },
    ],
  },
  {
    slug: 'club-car-ds-48v',
    brand: 'Club Car',
    model: 'DS 48V',
    fullName: 'Club Car DS 48V',
    yearRange: '1995–2014',
    voltage: '48V',
    popularity: 'High',
    cartIntro:
      'The Club Car DS in 48V form was the workhorse of the late 1990s and 2000s — millions of units still in service. It\'s the perfect candidate for lithium: simple electronics, durable frame, plentiful aftermarket support, and a battery tray that accommodates the lithium kit easily. A 48V DS with lithium drives like a brand-new cart at a fraction of the cost of replacing it.',
    recommendedSkus: {
      primary: '113-LR51V105AH',
      budget: '113-LR51V65AH',
    },
    installNotes: [
      'DS battery tray fits 6× 8V lead-acid pack — lithium kit includes adapter brackets for proper securement in the same space.',
      'DS chassis is aluminum (1995+) so corrosion at battery terminals is rare; clean any acid residue from the tray before installing the new lithium pack.',
      'Older DS models with the resistor-based controller will see modest improvements; carts upgraded to a solid-state controller (Alltrax/Navitas) see dramatic improvements.',
      'DS carts in fleet use (golf course/resort) often have weak motors after 15+ years — pair lithium with a motor rebuild for best results.',
    ],
    rangeEstimate: '35–50 miles per charge with the 48V 105Ah kit',
    faq: [
      {
        q: 'My DS is a 1998 model — will lithium still work?',
        a: 'Yes. Any 48V DS from 1995 forward is compatible with lithium. The conversion is identical regardless of model year within the 48V era.',
      },
      {
        q: 'Should I upgrade the motor at the same time?',
        a: 'If your motor sounds tired or the cart feels weak even with new batteries, yes. A motor + lithium combo can make an old DS feel brand new for around $1,500 total in parts.',
      },
    ],
  },
  {
    slug: 'club-car-ds-36v',
    brand: 'Club Car',
    model: 'DS 36V',
    fullName: 'Club Car DS 36V',
    yearRange: '1981–1995',
    voltage: '36V',
    popularity: 'Medium',
    cartIntro:
      'The 36V Club Car DS predates the 48V version and remains common in older personal-use carts. While many owners eventually swap to 48V, a 36V lithium upgrade is the cheapest path to extending an old DS another decade. Perfect for a property cart, hunting cart, or backup vehicle.',
    recommendedSkus: {
      primary: '113-LR38V105AH',
      budget: '113-LR38V65AH',
    },
    installNotes: [
      '36V DS uses 6× 6V lead-acid batteries — single lithium pack with adapter brackets fits the same tray.',
      'These older DS carts often have steel frames (pre-1995) — check battery tray for rust before installing the new pack.',
      'If you want more speed/power, plan for a full 48V conversion (motor + controller + batteries) instead — staying 36V keeps costs down but limits performance.',
    ],
    rangeEstimate: '25–40 miles per charge with the 36V 105Ah kit',
    faq: [
      {
        q: 'Is it worth converting my old 36V DS to lithium vs buying a new cart?',
        a: 'A lithium upgrade costs $1,300–$1,800 vs $8,000+ for a new cart. If your existing cart\'s frame, motor, and controller are sound, lithium extends its life by 10+ years for a fraction of the cost.',
      },
    ],
  },
  {
    slug: 'club-car-tempo-48v',
    brand: 'Club Car',
    model: 'Tempo 48V',
    fullName: 'Club Car Tempo 48V',
    yearRange: '2018–Present',
    voltage: '48V',
    popularity: 'High',
    cartIntro:
      'The Club Car Tempo replaced the Precedent in 2018 with a more aerodynamic body and updated electronics. Like its predecessor, the Tempo handles lithium drop-in conversions easily. The newer ICON dash and integrated OBC are fully lithium-compatible.',
    recommendedSkus: {
      primary: '113-LR51V105AH',
      extendedRange: '113-LR51V120AH',
    },
    installNotes: [
      'Tempo battery tray is similar to the Precedent — 6× 8V lead-acid replaced by the single lithium pack with adapter brackets.',
      'The Tempo\'s ICON dash and integrated OBC report state-of-charge accurately with lithium\'s flatter voltage curve.',
      'Newer Tempos with the Tempo Connect (Bluetooth telematics) work alongside the lithium battery\'s own Bluetooth app — both can be active without conflict.',
      'Many Tempos came with the optional Light Kit — the included DC-to-DC converter handles all 12V accessories.',
    ],
    rangeEstimate: '40–55 miles per charge with the 48V 105Ah kit',
    faq: [
      {
        q: 'My Tempo is still under warranty — will lithium void it?',
        a: 'Check with your Club Car dealer first. Most manufacturer warranties cover defects, not battery upgrades, but they may have specific guidance on aftermarket battery packs.',
      },
      {
        q: 'Will my factory Delta-Q charger work?',
        a: 'No. The factory Delta-Q is programmed for lead-acid. The conversion kit includes a properly-programmed LiFePO4 charger.',
      },
    ],
  },

  // ─────────── Yamaha ───────────
  {
    slug: 'yamaha-drive-48v',
    brand: 'Yamaha',
    model: 'Drive 48V',
    fullName: 'Yamaha Drive 48V',
    yearRange: '2007–2016',
    voltage: '48V',
    popularity: 'High',
    cartIntro:
      'The Yamaha Drive (G29) introduced the 48V era for Yamaha and remains one of the most reliable carts on the market. It\'s known for a tight turning radius, durable frame, and excellent fit-and-finish. The 48V system accepts lithium without controller changes, and the weight reduction is particularly noticeable on the Drive\'s already-nimble chassis.',
    recommendedSkus: {
      primary: '113-LR51V105AH',
      budget: '113-LR51V65AH',
    },
    installNotes: [
      'Drive uses 6× 8V batteries — lithium kit includes adapter brackets for the battery tray.',
      'Yamaha\'s solid-state controller is fully lithium-compatible — no programming changes needed.',
      'The Drive\'s mechanical accelerator pedal and brake system are unaffected by the battery change.',
      'Drives equipped with the optional 12V accessory port require the included DC-to-DC converter.',
    ],
    rangeEstimate: '40–50 miles per charge with the 48V 105Ah kit',
    faq: [
      {
        q: 'Will a lithium upgrade improve my Drive\'s hill climbing?',
        a: 'Yes — meaningfully. The 200 lb weight reduction plus lithium\'s steady voltage (no sag under load) means the Drive climbs hills with less motor strain and more speed.',
      },
      {
        q: 'How does lithium affect the Drive\'s tight turning radius?',
        a: 'No change — the lithium battery sits in the same location as the lead-acid pack. The turning radius remains the same, but the lighter cart feels more responsive in tight maneuvers.',
      },
    ],
  },
  {
    slug: 'yamaha-drive2-48v',
    brand: 'Yamaha',
    model: 'Drive2 48V',
    fullName: 'Yamaha Drive2 48V',
    yearRange: '2017–Present',
    voltage: '48V',
    popularity: 'High',
    cartIntro:
      'The Drive2 (G30) added Yamaha\'s ClearStream fuel-injection (gas models) and refined the electric powertrain with new controller and motor options. The electric Drive2 uses an upgraded 48V system with QuieTech AC drive — lithium pairs perfectly with the AC motor, delivering range improvements of 40%+ over lead-acid.',
    recommendedSkus: {
      primary: '113-LR51V105AH',
      extendedRange: '113-LR51V120AH',
    },
    installNotes: [
      'Drive2 electric uses 4× 12V lead-acid batteries (similar to RXV layout) — single lithium pack replaces all 4.',
      'AC drive electric Drive2 models benefit MORE from lithium than DC drive models — the AC motor stays in its efficiency band longer with stable lithium voltage.',
      'Factory charger is lead-acid only; replace with the kit\'s LiFePO4-programmed charger.',
      'The Drive2\'s integrated voltage display reads accurately with lithium throughout the discharge cycle.',
    ],
    rangeEstimate: '45–60 miles per charge with the 48V 105Ah kit',
    faq: [
      {
        q: 'Why does the Drive2 get more range than the Drive with the same battery?',
        a: 'The Drive2 uses Yamaha\'s newer QuieTech AC drive which is more efficient than the Drive\'s older DC system. Same battery, more efficient motor = more miles.',
      },
      {
        q: 'Is the AC controller more sensitive to battery voltage?',
        a: 'It actually performs BETTER with lithium because lithium voltage stays high throughout discharge. AC controllers run more efficiently at higher voltages.',
      },
    ],
  },
  {
    slug: 'yamaha-g14-g16-36v',
    brand: 'Yamaha',
    model: 'G14/G16/G19 36V',
    fullName: 'Yamaha G14, G16, G19 (36V)',
    yearRange: '1995–2002',
    voltage: '36V',
    popularity: 'Niche',
    cartIntro:
      'Yamaha\'s G14 (1995–1996), G16 (1996–2002), and G19 (1996–2002) were the 36V workhorses of the late 1990s. Many are still in service as personal carts, property runners, or hunting carts. A 36V lithium upgrade extends an old G-series another decade for around $1,300–$1,800.',
    recommendedSkus: {
      primary: '113-LR38V105AH',
      budget: '113-LR38V65AH',
    },
    installNotes: [
      '36V G-series uses 6× 6V batteries — lithium kit consolidates to a single pack with adapter brackets.',
      'Yamaha\'s 36V solid-state controller (G14 onwards) is lithium-compatible.',
      'Older G-series sometimes have rust on the steel frame — inspect and treat the battery tray before installing the new pack.',
      'G-series accessories are minimal — most carts won\'t need the DC-to-DC converter unless aftermarket lights have been added.',
    ],
    rangeEstimate: '25–40 miles per charge with the 36V 105Ah kit',
    faq: [
      {
        q: 'My G16 is a 1998 — will the kit fit?',
        a: 'Yes. The 36V Yamaha battery tray dimensions remained consistent through the G14/G16/G19 era. The kit\'s adapter brackets accommodate the standard tray.',
      },
      {
        q: 'Should I just buy a new cart instead?',
        a: 'A 36V lithium upgrade costs $1,300–$1,800 vs $7,000+ for a new electric cart. If your G-series frame, motor, and brakes are sound, lithium gives you another decade of service for a fraction of the cost.',
      },
    ],
  },
];

/**
 * Helper to look up a cart by slug.
 */
export function getCartModel(slug: string): CartModel | undefined {
  return CART_MODELS.find((c) => c.slug === slug);
}
