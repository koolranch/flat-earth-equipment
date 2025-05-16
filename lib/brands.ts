export interface BrandInfo {
  slug: string;
  name: string;
  logoUrl: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
}

/**
 * ===== Static brand list =====
 * • slug  → lower-case, hyphens
 * • logoUrl → path matches your Supabase bucket
 * • intro / SEO fields: tweak any time.
 */
export const brands: BrandInfo[] = [
  {
    slug: 'caterpillar',
    name: 'Caterpillar',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos//caterpillar.webp',
    intro:
      'Flat Earth Equipment carries precision-fit Caterpillar replacement parts and selected Cat telehandler rentals across the West.',
    seoTitle: 'Caterpillar Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Order genuine-fit Caterpillar parts or rent Cat equipment—fast shipping to WY, MT, NM.',
  },
  {
    slug: 'bobcat',
    name: 'Bobcat',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Bobcat.webp',
    intro:
      'Your source for Bobcat skid-steer parts, tracks, and compact loader rentals.',
    seoTitle: 'Bobcat Skid-Steer Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Shop Bobcat parts or rent Bobcat skid-steers. Same-day dispatch.',
  },
  {
    slug: 'genie',
    name: 'Genie',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Genie.webp',
    intro:
      'OEM-fit Genie lift parts plus job-ready Genie boom & scissor lift rentals.',
    seoTitle: 'Genie Lift Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Buy Genie boom-lift parts online or rent Genie lifts today.',
  },
  {
    slug: 'jlg',
    name: 'JLG',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/JLG.webp',
    intro:
      'We keep JLG lifts running with filters, joysticks, chargers, and more—plus on-demand JLG boom-lift rentals.',
    seoTitle: 'JLG Boom Lift Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Find JLG parts for 450AJ, 600AJ and more, or rent JLG lifts in minutes.',
  },
  {
    slug: 'skyjack',
    name: 'Skyjack',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Skyjack.webp',
    intro:
      'Skyjack scissor-lift parts shipped same-day and SJIII lift rentals available.',
    seoTitle: 'Skyjack Scissor-Lift Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Get Skyjack lift parts or rent Skyjack scissor lifts across WY, MT, NM.',
  },
  {
    slug: 'skytrak',
    name: 'Skytrak',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Skytrak.webp',
    intro:
      'Skytrak telehandler parts, manuals, and 8042 / 10054 rentals in stock.',
    seoTitle: 'Skytrak Telehandler Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Buy Skytrak parts or rent Skytrak 8042 & 10054 telehandlers.',
  },
  {
    slug: 'toyota',
    name: 'Toyota',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Toyota.webp',
    intro:
      'Warehouse-ready Toyota forklift parts and LPG truck rentals.',
    seoTitle: 'Toyota Forklift Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Shop Toyota 8FGCU25 forklift parts or book a rental today.',
  },
  {
    slug: 'hyster',
    name: 'Hyster',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Hyster.webp',
    intro:
      'Top-quality Hyster forklift filters, chains, and fault-code parts shipped nationwide.',
    seoTitle: 'Hyster Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Buy Hyster forklift parts online—fast, reliable shipping.',
  },
  {
    slug: 'yale',
    name: 'Yale',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Yale.webp',
    intro:
      'Precision-fit Yale forklift seats, tires, and safety-critical parts.',
    seoTitle: 'Yale Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Get Yale GLP050VX parts shipped same-day from Flat Earth Equipment.',
  },
  {
    slug: 'doosan',
    name: 'Doosan',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Doosan.webp',
    intro:
      'Doosan dual-fuel forklift parts for fast fleet uptime.',
    seoTitle: 'Doosan Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Shop Doosan G25E-7 parts, filters, and more—nationwide shipping.',
  },
  {
    slug: 'case',
    name: 'Case',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos//case-construction.webp',
    intro:
      'Flat Earth Equipment supplies Case skid-steer and backhoe parts, plus select Case loader rentals.',
    seoTitle: 'Case Construction Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Buy Case loader parts or rent Case 1840 skid-steers. Western-tough service.',
  },
  {
    slug: 'john-deere',
    name: 'John Deere',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/John_Deere.webp',
    intro:
      'OEM-fit John Deere skid-steer parts and compact equipment rentals.',
    seoTitle: 'John Deere Skid-Steer Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Shop John Deere skid-steer parts or rent Deere 320 / 250 loaders today.',
  },
  {
    slug: 'kubota',
    name: 'Kubota',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Kubota.webp',
    intro:
      'We keep Kubota SVL track loaders running with tracks, filters, and hydraulic parts.',
    seoTitle: 'Kubota SVL Track Loader Parts | Flat Earth Equipment',
    seoDescription:
      'Buy Kubota SVL75 / SVL95 parts online—fast shipping across the West.',
  },
  {
    slug: 'takeuchi',
    name: 'Takeuchi',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Takeuchi.webp',
    intro:
      'Takeuchi TL8 / TL12 track loader parts and compact loader rentals in stock.',
    seoTitle: 'Takeuchi Track Loader Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Order Takeuchi TL12 parts or rent TL8 loaders—same-day dispatch.',
  },
  {
    slug: 'vermeer',
    name: 'Vermeer',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Vermeer.webp',
    intro:
      'Vermeer mini skid-steer parts, CTX100 rentals, and auger attachments.',
    seoTitle: 'Vermeer Compact Equipment Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Get Vermeer CTX100 parts or rent Vermeer mini skid-steers today.',
  },
  {
    slug: 'jcb',
    name: 'JCB',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/JCB.webp',
    intro:
      'Flat Earth Equipment stocks JCB telehandler parts plus popular JCB 510-56 rentals.',
    seoTitle: 'JCB Telehandler Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Buy JCB 510-56 parts or rent a JCB telehandler—fast delivery.',
  },
  {
    slug: 'snorkel',
    name: 'Snorkel',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Snorkel.webp',
    intro:
      'Snorkel TB60/TB80 boom-lift parts and lift rentals available.',
    seoTitle: 'Snorkel Boom-Lift Parts & Rentals | Flat Earth Equipment',
    seoDescription:
      'Order Snorkel lift parts or rent Snorkel boom lifts across WY, MT, NM.',
  },
  {
    slug: 'sinoboom',
    name: 'Sinoboom',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Sinoboom.webp',
    intro:
      'Sinoboom aerial lift parts shipped nationwide with Western-grade support.',
    seoTitle: 'Sinoboom Lift Parts | Flat Earth Equipment',
    seoDescription:
      'Buy Sinoboom lift parts online—competitive pricing and fast shipping.'
  },
  {
    slug: 'ep',
    name: 'EP',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/EP.webp',
    intro:
      'EP charger modules and golf cart parts with precision-fit replacements in stock.',
    seoTitle: 'EP Charger Modules & Parts | Flat Earth Equipment',
    seoDescription:
      'Shop EP battery charger modules or replacement parts—fast shipping across the West.',
  },
  {
    slug: 'factory-cat',
    name: 'Factory Cat',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Factory_Cat.webp',
    intro:
      'Factory Cat industrial scrubber parts and service kits ready to ship.',
    seoTitle: 'Factory Cat Scrubber Parts & Service Kits | Flat Earth Equipment',
    seoDescription:
      'Find Factory Cat replacement parts for scrubbers—same-day dispatch available.',
  },
  {
    slug: 'enersys',
    name: 'EnerSys',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/EnerSys.png',
    intro:
      'EnerSys battery modules and charger components with guaranteed OEM fit.',
    seoTitle: 'EnerSys Battery Modules & Charger Parts | Flat Earth Equipment',
    seoDescription:
      'Order EnerSys battery modules or charger parts—fast, reliable shipping.',
  },
  {
    slug: 'liugong',
    name: 'LiuGong',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/LiuGong.png',
    intro:
      'LiuGong loaders and mini-excavator parts stocked for quick fulfillment.',
    seoTitle: 'LiuGong Loader & Excavator Parts | Flat Earth Equipment',
    seoDescription:
      'Shop LiuGong replacement parts for loaders and mini-excavators—nationwide delivery.'
  },
  {
    slug: 'clark',
    name: 'Clark',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Clark.webp',
    intro:
      'Precision-fit Clark forklift parts and warehouse equipment components, in stock and ready to ship.',
    seoTitle: 'Clark Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Shop Clark forklift parts and warehouse components with same-day dispatch across the USA',
  },
  {
    slug: 'crown',
    name: 'Crown',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Crown.webp',
    intro:
      'Crown forklift parts and maintenance kits, with expert guidance from our team.',
    seoTitle: 'Crown Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Order Crown forklift parts and service components—fast, reliable shipping.',
  },
  {
    slug: 'gehl',
    name: 'Gehl',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Gehl.webp',
    intro:
      'High-quality Gehl loader and telehandler parts, tested for durability.',
    seoTitle: 'Gehl Loader & Telehandler Parts | Flat Earth Equipment',
    seoDescription:
      'Buy Gehl loader and telehandler replacement parts—nationwide shipping.',
  },
  {
    slug: 'hangcha',
    name: 'Hangcha',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Hangcha.webp',
    intro:
      'Stocked Hangcha forklift parts and accessories for fast fleet uptime.',
    seoTitle: 'Hangcha Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Shop Hangcha forklift parts online—same-day shipping.',
  },
  {
    slug: 'heli',
    name: 'Heli',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Heli.webp',
    intro:
      'Heli forklift parts and attachments in stock for quick fulfillment.',
    seoTitle: 'Heli Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Order Heli forklift parts today—fast dispatch across the USA.',
  },
  {
    slug: 'hyundai',
    name: 'Hyundai',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Hyundai.webp',
    intro:
      'Genuine Hyundai forklift parts, filters, and hydraulics ready to ship.',
    seoTitle: 'Hyundai Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Buy Hyundai forklift parts online—Western U.S. focus, nationwide shipping.',
  },
  {
    slug: 'karcher',
    name: 'Kärcher',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Karcher.webp',
    intro:
      'Kärcher pressure washer and cleaning equipment parts shipped nationwide.',
    seoTitle: 'Kärcher Cleaning Equipment Parts | Flat Earth Equipment',
    seoDescription:
      'Order Kärcher washer parts and accessories—fast, reliable service.',
  },
  {
    slug: 'komatsu',
    name: 'Komatsu',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Komatsu.webp',
    intro:
      'Komatsu heavy-equipment parts, pins, bushings, and service kits in stock.',
    seoTitle: 'Komatsu Heavy Equipment Parts | Flat Earth Equipment',
    seoDescription:
      'Shop Komatsu loader and excavator parts—same-day shipping.',
  },
  {
    slug: 'lcmg',
    name: 'LCMG',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/LCMG.webp',
    intro:
      'LCMG lift truck parts and components for durable performance.',
    seoTitle: 'LCMG Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Buy LCMG forklift parts online—quick shipping across the USA.',
  },
  {
    slug: 'linde',
    name: 'Linde',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Linde.webp',
    intro:
      'Precision-fit Linde forklift parts, from motors to masts.',
    seoTitle: 'Linde Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Order Linde forklift components today—same-day dispatch.',
  },
  {
    slug: 'lull',
    name: 'Lull',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Lull.webp',
    intro:
      'Lull telehandler parts and service kits, in stock and ready to ship.',
    seoTitle: 'Lull Telehandler Parts | Flat Earth Equipment',
    seoDescription:
      'Shop Lull telehandler replacement parts—fast delivery.',
  },
  {
    slug: 'mec',
    name: 'MEC',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/MEC.webp',
    intro:
      'MEC aerial and scissor-lift parts, tested for safety and durability.',
    seoTitle: 'MEC Lift Parts | Flat Earth Equipment',
    seoDescription:
      'Buy MEC lift parts online—same-day shipping across the nation.',
  },
  {
    slug: 'mitsubishi-forklift',
    name: 'Mitsubishi Forklift',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Mitsubishi_Forklift.webp',
    intro:
      'Mitsubishi forklift parts, including transmissions and hydraulics.',
    seoTitle: 'Mitsubishi Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Order Mitsubishi forklift components—fast, reliable delivery.',
  },
  {
    slug: 'moffett',
    name: 'Moffett',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Moffett.webp',
    intro:
      'Moffett truck-mounted forklift parts and service kits ready to ship.',
    seoTitle: 'Moffett Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Buy Moffett forklift parts online—same-day shipping available.',
  },
  {
    slug: 'nissan-forklift',
    name: 'Nissan Forklift',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Nissan_Forklift.webp',
    intro:
      'Nissan forklift parts, including engines, forks, and electrical.',
    seoTitle: 'Nissan Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Shop Nissan forklift components—nationwide shipping.',
  },
  {
    slug: 'powerboss',
    name: 'PowerBoss',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/PowerBoss.webp',
    intro:
      'PowerBoss floor-scrubber and sweeper parts in stock for fast fulfillment.',
    seoTitle: 'PowerBoss Cleaning Equipment Parts | Flat Earth Equipment',
    seoDescription:
      'Order PowerBoss scrubber parts—same-day shipping.',
  },
  {
    slug: 'raymond',
    name: 'Raymond',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Raymond.webp',
    intro:
      'Raymond forklift parts, from controllers to chassis components.',
    seoTitle: 'Raymond Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Get Raymond forklift parts with fast shipping across the USA.',
  },
  {
    slug: 'tailift',
    name: 'Tailift',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Tailift.webp',
    intro:
      'Tailift scissor- and boom-lift parts, tested for reliability.',
    seoTitle: 'Tailift Lift Parts | Flat Earth Equipment',
    seoDescription:
      'Shop Tailift lift parts online—Multiple USA DCs, fast delivery.',
  },
  {
    slug: 'tcm',
    name: 'TCM',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/TCM.webp',
    intro:
      'TCM forklift parts, including hydraulics and electrics.',
    seoTitle: 'TCM Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Order TCM forklift components—same-day shipping available.',
  },
  {
    slug: 'tennant',
    name: 'Tennant',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/Tennant.webp',
    intro:
      'Tennant industrial cleaner parts and brushes in stock for quick dispatch.',
    seoTitle: 'Tennant Cleaning Equipment Parts | Flat Earth Equipment',
    seoDescription:
      'Buy Tennant cleaner parts online—fast shipping.',
  },
  {
    slug: 'unicarrriers',
    name: 'UniCarrriers',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/UniCarriers.webp',
    intro:
      'UniCarriers forklift parts and attachments, ready to ship.',
    seoTitle: 'UniCarriers Forklift Parts | Flat Earth Equipment',
    seoDescription:
      'Shop UniCarriers parts online—same-day shipping across the nation.',
  },
  {
    slug: 'xcmg',
    name: 'XCMG',
    logoUrl:
      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/XCMG.webp',
    intro:
      'XCMG heavy-equipment parts for loaders, excavators, and more.',
    seoTitle: 'XCMG Equipment Parts | Flat Earth Equipment',
    seoDescription:
      'Order XCMG replacement parts—fast delivery to every state.',
  },
]; 