import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

// Fetch all part slugs from Supabase for sitemap inclusion
async function loadPartSlugs() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];
    const supabase = createClient(url, key);
    const slugs = [];
    let from = 0;
    const batchSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from('parts')
        .select('slug')
        .not('slug', 'is', null)
        .range(from, from + batchSize - 1);
      if (error || !data || data.length === 0) break;
      slugs.push(...data.map(r => r.slug));
      if (data.length < batchSize) break;
      from += batchSize;
    }
    return slugs;
  } catch (e) { return []; }
}

// Fetch rental equipment slugs from Supabase
async function loadRentalSlugs() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('rental_equipment')
      .select('seo_slug, category');
    if (error || !data) return [];
    return data;
  } catch (e) { return []; }
}

// Fetch compatibility machine models from Supabase
async function loadMachineModels() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('machine_models')
      .select('brand_slug, slug')
      .not('brand_slug', 'is', null)
      .not('slug', 'is', null);
    if (error || !data) return [];
    return data;
  } catch (e) { return []; }
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

// Compatibility hub pages - all brands from static data + Supabase
const COMPATIBILITY_BRANDS = [
  'cushman', 'ezgo', 'genie', 'cat', 'skyjack', 'bt', 'jungheinrich', 'jlg', 'yale', 'toyota',
  'bobcat', 'crown', 'hyster', 'jcb', 'kubota', 'raymond', 'taylor-dunn', 'toro',
];

// Static compatibility model pages (will be merged with Supabase data at build time)
const COMPATIBILITY_MODELS = [
  { brand: 'yale', model: 'erc050' },
  { brand: 'yale', model: 'erc050vg' },
  { brand: 'cushman', model: 'hauler' },
  { brand: 'cushman', model: 'shuttle' },
  { brand: 'cat', model: 'f50' },
  { brand: 'genie', model: 'gs-1930' },
  { brand: 'genie', model: 'gs-1932' },
  { brand: 'jungheinrich', model: 'efg-series' },
  { brand: 'jungheinrich', model: 'efg-216' },
  { brand: 'toyota', model: '7fbe15' },
  { brand: 'toyota', model: '8fbcu25' },
  { brand: 'hyster', model: 'e50xn' },
  { brand: 'jlg', model: '1930es' },
  { brand: 'jlg', model: '2030es' },
  { brand: 'jlg', model: '2630es' },
  { brand: 'skyjack', model: 'sjiii-3219' },
  { brand: 'skyjack', model: 'sjiii-3226' },
  { brand: 'bt', model: 'levio' },
  { brand: 'ezgo', model: 'rxv' },
  { brand: 'ezgo', model: 'txt' },
  { brand: 'taylor-dunn', model: 'bigfoot' },
  { brand: 'bobcat', model: 'e19e' },
  { brand: 'bobcat', model: 's650' },
  { brand: 'bobcat', model: 't7x' },
  { brand: 'crown', model: 'pe-4500' },
  { brand: 'crown', model: 'rr-5700' },
  { brand: 'jcb', model: '19c-1' },
  { brand: 'jcb', model: '3ts-8t' },
  { brand: 'jcb', model: '507-42' },
  { brand: 'kubota', model: 'kx040-4' },
  { brand: 'kubota', model: 'svl75-2' },
  { brand: 'raymond', model: '102xm' },
  { brand: 'raymond', model: '7400' },
  { brand: 'toro', model: 'dingo-tx-1000' },
  { brand: 'toro', model: 'dingo-tx-427' },
  { brand: 'toro', model: 'dingo-tx-525' },
];

// Rental category slugs (map DB categories to URL slugs)
const RENTAL_CATEGORIES = [
  'forklift', 'scissor-lift', 'boom-lift', 'telehandler',
  'compact-utility-loader', 'skid-steer', 'attachment',
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
  '/insights',
  '/legal/terms',
  '/legal/privacy',
  '/forks',
  '/warranty',
  '/shipping-returns',
  '/privacy-policy',
  '/terms-of-service',
  '/locations',
  '/electric-vehicle-chargers',
  '/osha-operator-training',
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
    const seen = new Set(); // Deduplicate URLs
    
    function add(loc, priority = 0.5, changefreq = 'weekly') {
      if (seen.has(loc)) return;
      seen.add(loc);
      items.push({ loc, priority, changefreq });
    }
    
    // =========================================================================
    // 1. Brand pages (fault-codes, serial-lookup, guide)
    // =========================================================================
    const allBrands = [
      'jlg','genie','toyota','jcb','hyster','crown','clark','yale','raymond','cat',
      'komatsu','doosan','mitsubishi','linde','jungheinrich','bobcat','case','new-holland',
      'kubota','takeuchi','john-deere','lcmg','nissan','enersys','heli','liugong','mec',
      'moffett','powerboss','skytrak','snorkel','tailift','tcm',
      ...scaled,
    ];
    
    for (const slug of allBrands){
      if (BRANDS_WITH_SERIAL_TOOLS.has(slug)) {
        add(`/brand/${slug}/serial-lookup`, 0.8);
        add(`/es/brand/${slug}/serial-lookup`, 0.6);
      }
      add(`/brand/${slug}/fault-codes`, 0.7);
      add(`/brand/${slug}/guide`, 0.6);
      add(`/es/brand/${slug}/fault-codes`, 0.5);
      add(`/es/brand/${slug}/guide`, 0.5);
    }
    
    // Static brand hub pages (JCB, Toyota have dedicated pages)
    add('/brand/jcb', 0.7);
    add('/brand/toyota', 0.7);
    
    // =========================================================================
    // 2. Standalone serial lookup pages (legacy URLs)
    // =========================================================================
    for (const page of STANDALONE_SERIAL_PAGES) {
      add(page, 0.8);
    }
    
    // =========================================================================
    // 3. Diagnostic code pages
    // =========================================================================
    for (const page of DIAGNOSTIC_CODE_PAGES) {
      add(page, 0.7);
    }
    
    // =========================================================================
    // 4. Compatibility pages (static + Supabase machine models)
    // =========================================================================
    add('/compatibility', 0.8);
    for (const brand of COMPATIBILITY_BRANDS) {
      add(`/compatibility/${brand}`, 0.7);
    }
    for (const { brand, model } of COMPATIBILITY_MODELS) {
      add(`/compatibility/${brand}/${model}`, 0.7);
    }
    // Merge in Supabase machine models
    const dbModels = await loadMachineModels();
    for (const m of dbModels) {
      add(`/compatibility/${m.brand_slug}`, 0.7);
      add(`/compatibility/${m.brand_slug}/${m.slug}`, 0.7);
    }
    
    // =========================================================================
    // 5. City landing pages
    // =========================================================================
    for (const page of CITY_PAGES) {
      add(page, 0.6);
    }
    
    // =========================================================================
    // 6. Parts content pages (manually curated high-value)
    // =========================================================================
    for (const page of PARTS_PAGES) {
      add(page, 0.7);
    }
    
    // =========================================================================
    // 7. Individual product pages from Supabase (~925 products)
    // =========================================================================
    const partSlugs = await loadPartSlugs();
    for (const slug of partSlugs) {
      add(`/parts/${slug}`, 0.6);
    }
    // Parts category pages
    const PARTS_CATEGORIES = [
      'jcb-controls', 'jcb-general', 'jcb-filters', 'jcb-brakes',
      'jcb-engine-parts', 'jcb-hydraulics', 'jcb-hydraulic-valves',
      'jcb-fuel-system', 'jcb-switches-sensors', 'jcb-cab-body',
      'jcb-undercarriage', 'jcb-seats', 'jcb-mounts-dampers',
    ];
    for (const cat of PARTS_CATEGORIES) {
      add(`/parts/category/${cat}`, 0.5);
    }
    
    // =========================================================================
    // 8. Rental pages (categories + individual equipment from Supabase)
    // =========================================================================
    for (const cat of RENTAL_CATEGORIES) {
      add(`/rentals/${cat}`, 0.6);
    }
    const rentalItems = await loadRentalSlugs();
    for (const item of rentalItems) {
      // Convert DB category to URL slug
      const catSlug = item.category.toLowerCase().replace(/\s+/g, '-');
      add(`/rentals/${catSlug}/${item.seo_slug}`, 0.5);
    }
    
    // =========================================================================
    // 9. Additional core pages
    // =========================================================================
    for (const page of ADDITIONAL_CORE_PAGES) {
      add(page, 0.6);
    }
    
    // =========================================================================
    // 10. Insight articles
    // =========================================================================
    for (const slug of insightSlugs) {
      const urlSlug = slug.split('/').pop();
      add(`/insights/${urlSlug}`, 0.7, 'monthly');
    }
    
    return items;
  }
};

export default config; 