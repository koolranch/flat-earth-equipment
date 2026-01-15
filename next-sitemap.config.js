import fs from 'fs';
import path from 'path';

function loadScale(){
  try{
    const p = path.join(process.cwd(),'content','brands-scale.json');
    const j = JSON.parse(fs.readFileSync(p,'utf8'));
    return (j.brands||[]).map(b=>b.slug);
  }catch(e){ return []; }
}

// Load insight slugs from content/insights directory
function loadInsightSlugs(){
  try{
    const insightsDir = path.join(process.cwd(),'content','insights');
    const files = fs.readdirSync(insightsDir, { recursive: true });
    return files
      .filter(f => f.endsWith('.mdx'))
      .map(f => f.replace('.mdx', '').replace(/\\/g, '/'));
  }catch(e){ return []; }
}

const scaled = loadScale();
const insightSlugs = loadInsightSlugs();

// Brands that have working serial lookup tools (must match page.tsx)
const BRANDS_WITH_SERIAL_TOOLS = new Set([
  'toyota', 'hyster', 'bobcat', 'crown', 'clark', 'cat', 'caterpillar',
  'doosan', 'jlg', 'karcher', 'factory-cat', 'factorycat', 'tennant',
  'haulotte', 'yale', 'raymond', 'ep', 'ep-equipment', 'linde',
  'mitsubishi', 'komatsu', 'case', 'case-construction', 'new-holland',
  'takeuchi', 'kubota', 'toro', 'xcmg', 'sinoboom', 'skyjack',
  'jungheinrich', 'gehl', 'hangcha', 'lull', 'manitou', 'unicarriers',
  'jcb', 'genie', 'hyundai'
]);

// State safety pages marked as noindex (Tier 3 low-traffic states)
// These have thin content and should NOT be in sitemap while noindexed
const NOINDEX_STATES = new Set([
  'mo', 'md', 'al', 'sc', 'ky', 'or', 'ok', 'ct', 'ut', 'nv', 'ks', 'ar',
  'nm', 'ne', 'wv', 'id', 'hi', 'nh', 'me', 'ri', 'mt', 'de', 'sd', 'nd',
  'ak', 'vt', 'wy', 'ia', 'ms'
]);

// Standalone serial lookup pages (legacy URLs with good rankings)
const STANDALONE_SERIAL_PAGES = [
  '/toyota-forklift-serial-lookup',
  '/hyster-serial-number-lookup',
  '/yale-serial-number-lookup',
  '/raymond-serial-number-lookup',
  '/crown-serial-number-lookup',
  '/clark-serial-number-lookup',
  '/cat-serial-number-lookup',
  '/bobcat-serial-number-lookup',
  '/case-serial-number-lookup',
  '/new-holland-serial-number-lookup',
  '/kubota-serial-number-lookup',
  '/takeuchi-serial-number-lookup',
  '/komatsu-serial-number-lookup',
  '/doosan-serial-number-lookup',
  '/mitsubishi-serial-number-lookup',
  '/jlg-serial-number-lookup',
  '/jcb-serial-number-lookup',
  '/genie-serial-number-lookup',
  '/factory-cat-serial-number-lookup',
  '/karcher-serial-number-lookup',
  '/tennant-serial-number-lookup',
  '/lull-serial-number-lookup',
  '/haulotte-serial-number-lookup',
  '/hangcha-serial-number-lookup',
  '/manitou-forklift-serial-number-lookup',
  '/hyundai-serial-number-lookup',
  '/jungheinrich-serial-number-lookup',
  '/skyjack-serial-number-lookup',
  '/linde-forklift-serial-number-lookup',
  '/ep-forklift-serial-number-lookup',
  '/sinoboom-serial-number-lookup',
  '/xcmg-serial-number-lookup',
  '/toro-serial-number-lookup',
  '/unicarriers-serial-number-lookup',
];

// Diagnostic code pages
const DIAGNOSTIC_CODE_PAGES = [
  '/diagnostic-codes/cat-forklift-fault-codes',
  '/diagnostic-codes/e43-code-nissan-forklift',
  '/diagnostic-codes/e-a5-1-code-on-toyota-forklift-2',
  '/diagnostic-codes/hyster-forklift-fault-codes',
  '/diagnostic-codes/toro-dingo-error-codes',
  '/diagnostic-codes/toyota-forklift-fault-codes',
  '/diagnostic-codes/toyota-01-01-fuel-feedback-error',
];

// Compatibility hub pages (brands with charger guides)
const COMPATIBILITY_BRANDS = [
  'cushman', 'ezgo', 'genie', 'cat', 'skyjack', 'bt', 'jungheinrich', 'jlg', 'yale', 'toyota',
];

// Compatibility model pages
const COMPATIBILITY_MODELS = [
  { brand: 'yale', model: 'erc050' },
  { brand: 'cushman', model: 'hauler' },
  { brand: 'cat', model: 'f50' },
  { brand: 'genie', model: 'gs-1930' },
  { brand: 'genie', model: 'gs-1932' },
  { brand: 'jungheinrich', model: 'efg-series' },
  { brand: 'toyota', model: '7fbe15' },
  { brand: 'toyota', model: '8fbcu25' },
];

// City landing pages
const CITY_PAGES = [
  '/colorado/denver',
  '/colorado/pueblo',
  '/montana/bozeman',
  '/texas/houston',
  '/texas/el-paso',
  '/texas/dallas-fort-worth',
  '/new-mexico',
  '/new-mexico/albuquerque',
  '/new-mexico/las-cruces',
  '/wyoming/cheyenne',
  '/arizona/phoenix',
];

// Parts pages (high-value content)
const PARTS_PAGES = [
  '/parts',
  '/parts/toyota-forklift-year-by-serial-number',
  '/parts/toyota-forklift-manuals',
  '/parts/construction-equipment-parts/your-bobcat-serial-number-how-to-find-and-use-it',
  '/parts/construction-equipment-parts/jcb-backhoe-serial-number-lookup',
  '/parts/construction-equipment-parts/new-holland-skid-steer-serial-number-lookup',
  '/parts/construction-equipment-parts/gehl-serial-number-lookup',
  '/parts/construction-equipment-parts/john-deere-skid-steer-product-identification-number-lookup',
  '/parts/construction-equipment-parts/case-loader-serial-number-lookup',
  '/parts/aerial-equipment/genie-scissor-lift-error-codes',
  '/parts/forklift-parts/nissan-k21-forklift-engine',
  '/parts/attachments/forks',
  '/parts/battery-charger-modules',
];

// Core pages that might be missed by auto-discovery
const ADDITIONAL_CORE_PAGES = [
  '/brands',
  '/charger-modules',
  '/compatibility',
  '/trainer',
  '/rent-equipment',
  '/carpet-poles',
  '/rentals/forklift',
  '/rentals/scissor-lift',
  '/insights',
  '/legal/terms',
];

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.flatearthequipment.com',
  generateRobotsTxt: true,
  alternateRefs: [
    { href: 'https://www.flatearthequipment.com', hreflang: 'en-US' },
    { href: 'https://www.flatearthequipment.com/es', hreflang: 'es-US' }
  ],
  // Exclude pages that are noindex or internal-only
  exclude: [
    // Charger pages (many lack images/prices and are noindexed)
    '/chargers/*',
    '/es/chargers/*',
    // Admin & internal pages
    '/admin/*',
    '/dashboard/*',
    '/dashboard-debug/*',
    '/dashboard-new/*',
    '/dashboard-simple/*',
    '/dashboard-simple-direct/*',
    // Training internal pages (quiz, exam, module progress)
    '/quiz/*',
    '/quiz-demo/*',
    '/exam/*',
    '/final-exam/*',
    '/module/*',
    '/practical/*',
    '/orientation/*',
    // Auth & account pages
    '/login/*',
    '/verify/*',
    '/redeem/*',
    '/claim/*',
    '/auth-test/*',
    // Test pages
    '/test-*',
    '/debug/*',
    // Cart & checkout (transactional)
    '/cart/*',
    '/checkout/*',
    // QA/internal tools
    '/qa-make-user/*',
    '/docs/*',
    // API routes (shouldn't be crawled anyway)
    '/api/*',
  ],
  transform: async (config, urlPath) => {
    // Exclude noindex state safety pages from sitemap
    const stateMatch = urlPath.match(/^\/safety\/forklift\/([a-z]{2})$/);
    if (stateMatch && NOINDEX_STATES.has(stateMatch[1])) {
      return null; // Exclude from sitemap
    }
    
    // Assign priorities based on page type
    let priority = 0.5;
    let changefreq = 'weekly';
    
    if (urlPath === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (urlPath.startsWith('/insights/')) {
      priority = 0.7;
      changefreq = 'monthly';
    } else if (urlPath.includes('serial-lookup') || urlPath.includes('serial-number-lookup')) {
      priority = 0.8;
    } else if (urlPath.startsWith('/brand/') || urlPath.startsWith('/es/brand/')) {
      priority = 0.7;
    } else if (urlPath.startsWith('/compatibility/')) {
      priority = 0.7;
    } else if (urlPath.startsWith('/diagnostic-codes/')) {
      priority = 0.7;
    } else if (urlPath.startsWith('/parts/')) {
      priority = 0.6;
    }
    
    return {
      loc: urlPath,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    const items = [];
    
    // All brands for fault-codes and guide pages (available for all brands)
    const allBrands = ['jlg','genie','toyota','jcb','hyster','crown','clark','yale','raymond','cat','komatsu','doosan','mitsubishi','linde','jungheinrich','bobcat','case','new-holland','kubota','takeuchi', ...scaled];
    
    for (const slug of allBrands){
      // Only add serial-lookup for brands that have the tool implemented
      if (BRANDS_WITH_SERIAL_TOOLS.has(slug)) {
        items.push({ loc: `/brand/${slug}/serial-lookup`, priority: 0.8 });
        items.push({ loc: `/es/brand/${slug}/serial-lookup`, priority: 0.6 });
      }
      // Fault codes and guide pages are available for all brands
      items.push({ loc: `/brand/${slug}/fault-codes`, priority: 0.7 });
      items.push({ loc: `/brand/${slug}/guide`, priority: 0.6 });
      items.push({ loc: `/es/brand/${slug}/fault-codes`, priority: 0.5 });
      items.push({ loc: `/es/brand/${slug}/guide`, priority: 0.5 });
    }
    
    // Standalone serial lookup pages (legacy URLs)
    for (const page of STANDALONE_SERIAL_PAGES) {
      items.push({ loc: page, priority: 0.8 });
    }
    
    // Diagnostic code pages
    for (const page of DIAGNOSTIC_CODE_PAGES) {
      items.push({ loc: page, priority: 0.7 });
    }
    
    // Compatibility hub pages
    items.push({ loc: '/compatibility', priority: 0.8 });
    for (const brand of COMPATIBILITY_BRANDS) {
      items.push({ loc: `/compatibility/${brand}`, priority: 0.7 });
    }
    for (const { brand, model } of COMPATIBILITY_MODELS) {
      items.push({ loc: `/compatibility/${brand}/${model}`, priority: 0.7 });
    }
    
    // City landing pages
    for (const page of CITY_PAGES) {
      items.push({ loc: page, priority: 0.6 });
    }
    
    // Parts pages
    for (const page of PARTS_PAGES) {
      items.push({ loc: page, priority: 0.7 });
    }
    
    // Additional core pages
    for (const page of ADDITIONAL_CORE_PAGES) {
      items.push({ loc: page, priority: 0.6 });
    }
    
    // Insight articles (216 articles!)
    for (const slug of insightSlugs) {
      // Handle nested paths (e.g., "construction equipment parts/..." -> flatten for URL)
      const urlSlug = slug.split('/').pop(); // Get just the filename part
      items.push({ loc: `/insights/${urlSlug}`, priority: 0.7, changefreq: 'monthly' });
    }
    
    return items;
  }
};

export default config; 