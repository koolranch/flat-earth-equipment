// next.config.js
import bundleAnalyzer from '@next/bundle-analyzer';
import createMDX from '@next/mdx';

const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === '1' });
const withMDX = createMDX({ extension: /\.mdx?$/ });

/** @type {import('next').NextConfig} */
const baseConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  cleanDistDir: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      // IndexNow key file - must be served at root for verification
      {
        source: '/e8f4a2b1c9d7e5f3.txt',
        destination: '/api/indexnow-key',
      },
    ];
  },
  async redirects() {
    return [
      // ============================================================
      // CRITICAL: Domain Canonicalization (301 Permanent)
      // These MUST be permanent to reclaim backlink authority
      // NOTE: API routes are EXCLUDED to prevent breaking webhooks
      // (301 redirects change POST to GET, breaking Stripe webhooks)
      // ============================================================
      
      // Redirect non-www to www (canonical domain) - PERMANENT 301
      // Excludes /api routes to preserve webhook POST requests
      {
        source: '/:path((?!api).*)',
        has: [{ type: 'host', value: 'flatearthequipment.com' }],
        destination: 'https://www.flatearthequipment.com/:path',
        permanent: true // 301 - Passes full link equity to www
      },
      
      // ============================================================
      // LOST BACKLINKS RECOVERY: Safety/Blog → Training Hub
      // Reclaim authority from old safety and blog content
      // ============================================================
      
      // Old safety training pages → Training revenue hub
      { source: '/safety-training', destination: '/training/forklift', permanent: true },
      { source: '/safety-training/:path*', destination: '/training/forklift', permanent: true },
      { source: '/forklift-safety', destination: '/training/forklift', permanent: true },
      { source: '/forklift-safety/:path*', destination: '/training/forklift', permanent: true },
      { source: '/operator-training', destination: '/training/forklift', permanent: true },
      { source: '/operator-training/:path*', destination: '/training/forklift', permanent: true },
      { source: '/certification', destination: '/training/forklift', permanent: true },
      { source: '/certification/:path*', destination: '/training/forklift', permanent: true },
      { source: '/osha-training', destination: '/training/forklift', permanent: true },
      { source: '/osha-certification', destination: '/training/forklift', permanent: true },
      { source: '/forklift-certification', destination: '/training/forklift', permanent: true },
      { source: '/forklift-license', destination: '/training/forklift', permanent: true },
      { source: '/blog/forklift-safety', destination: '/training/forklift', permanent: true },
      { source: '/blog/forklift-safety/:path*', destination: '/training/forklift', permanent: true },
      { source: '/blog/osha-requirements', destination: '/training/forklift', permanent: true },
      { source: '/blog/osha-requirements/:path*', destination: '/training/forklift', permanent: true },
      { source: '/blog/operator-certification', destination: '/training/forklift', permanent: true },
      { source: '/safety/training', destination: '/training/forklift', permanent: true },
      { source: '/safety/certification', destination: '/training/forklift', permanent: true },
      
      // ============================================================
      // LOST BACKLINKS RECOVERY: Rental/Equipment → Rent Equipment Hub
      // Reclaim authority from old rental and equipment listings
      // ============================================================
      
      // Old rental listing pages → Rental revenue hub
      { source: '/rental', destination: '/rent-equipment', permanent: true },
      { source: '/rentals', destination: '/rent-equipment', permanent: true },
      { source: '/equipment-rental', destination: '/rent-equipment', permanent: true },
      { source: '/equipment-rentals', destination: '/rent-equipment', permanent: true },
      { source: '/forklift-rental', destination: '/rent-equipment', permanent: true },
      { source: '/forklift-rentals', destination: '/rent-equipment', permanent: true },
      { source: '/scissor-lift-rental', destination: '/rent-equipment', permanent: true },
      { source: '/boom-lift-rental', destination: '/rent-equipment', permanent: true },
      { source: '/telehandler-rental', destination: '/rent-equipment', permanent: true },
      { source: '/equipment-for-rent', destination: '/rent-equipment', permanent: true },
      { source: '/rent', destination: '/rent-equipment', permanent: true },
      { source: '/rent/:slug', destination: '/rent-equipment', permanent: true },
      { source: '/equipment-listings', destination: '/rent-equipment', permanent: true },
      { source: '/equipment-listings/:path*', destination: '/rent-equipment', permanent: true },
      { source: '/available-equipment', destination: '/rent-equipment', permanent: true },
      { source: '/fleet', destination: '/rent-equipment', permanent: true },
      { source: '/fleet/:path*', destination: '/rent-equipment', permanent: true },
      
      // ============================================================
      // LOST BACKLINKS RECOVERY: Contact Variants → Contact Hub
      // Reclaim authority from old contact page URLs
      // ============================================================
      
      { source: '/contact-us', destination: '/contact', permanent: true },
      { source: '/contactus', destination: '/contact', permanent: true },
      { source: '/get-in-touch', destination: '/contact', permanent: true },
      { source: '/get-quote', destination: '/contact', permanent: true },
      { source: '/get-a-quote', destination: '/contact', permanent: true },
      { source: '/quote', destination: '/contact', permanent: true },
      { source: '/request-quote', destination: '/contact', permanent: true },
      { source: '/request-a-quote', destination: '/contact', permanent: true },
      { source: '/inquiry', destination: '/contact', permanent: true },
      { source: '/inquiries', destination: '/contact', permanent: true },
      { source: '/support', destination: '/contact', permanent: true },
      { source: '/support/:path*', destination: '/contact', permanent: true },
      { source: '/help', destination: '/contact', permanent: true },
      { source: '/customer-service', destination: '/contact', permanent: true },
      { source: '/sales', destination: '/contact', permanent: true },
      
      // ============================================================
      // EXISTING REDIRECTS: Charger Modules Consolidation
      // ============================================================
      
      // Redirect old charger module product pages to new landing page
      {
        source: '/parts/enersys-forklift-charger-module-6la20671',
        destination: '/charger-modules',
        permanent: true // 301 redirect - preserves SEO
      },
      {
        source: '/parts/hawker-forklift-charger-module-6la20671',
        destination: '/charger-modules',
        permanent: true // 301 redirect - preserves SEO
      },
      // Catch-all for any other old charger module URLs
      {
        source: '/parts/:brand-forklift-charger-module-:model',
        destination: '/charger-modules',
        permanent: true // 301 redirect - preserves SEO
      },
      // Redirect placeholder insight to canonical charger modules landing
      {
        source: '/insights/battery-charger-modules',
        destination: '/charger-modules',
        permanent: true
      },
      // Redirect old battery-charger-modules page to canonical charger-modules
      // BACKLINK RECOVERY: Trailing-slash variant must come FIRST
      // Bypasses Next.js's automatic 308 trailing-slash normalization
      {
        source: '/battery-charger-modules/',
        destination: '/charger-modules',
        permanent: true // 301 - Direct to final destination (itsupplychain.com DR63)
      },
      {
        source: '/battery-charger-modules',
        destination: '/charger-modules',
        permanent: true // 301 redirect - preserves SEO
      },
      
      // ============================================================
      // EXISTING REDIRECTS: Placeholder Insights
      // ============================================================
      
      // Redirect additional placeholder insights to canonical targets
      {
        source: '/insights/bozeman-mt',
        destination: '/montana/bozeman',
        permanent: true
      },
      {
        source: '/insights/by-brand',
        destination: '/brands',
        permanent: true
      },
      {
        source: '/insights/carpet-poles',
        destination: '/carpet-poles',
        permanent: true
      },
      {
        source: '/insights/cat-91a1431010-vinyl-suspension-seat',
        destination: '/parts/attachments',
        permanent: true
      },
      // Fork placeholder insights -> Forks landing
      {
        source: '/insights/forklift-forks-class-ii-std-taper-42-x-5-x-1-75',
        destination: '/forks',
        permanent: true
      },
      {
        source: '/insights/forklift-forks-class-ii-std-taper-48-x-4-x-1-75',
        destination: '/forks',
        permanent: true
      },
      {
        source: '/insights/forklift-forks-class-ii-std-taper-48-x-5-x-1-75',
        destination: '/forks',
        permanent: true
      },
      {
        source: '/insights/forklift-forks-class-ii-std-taper-54-x-5-x-1-75',
        destination: '/forks',
        permanent: true
      },
      {
        source: '/insights/forklift-forks-class-ii-std-taper-72-x-4-x-1-75',
        destination: '/forks',
        permanent: true
      },
      // Consolidate fork pages - redirect detailed page to main fork finder
      // BACKLINK RECOVERY: Trailing-slash variant must come FIRST
      // Bypasses Next.js's automatic 308 trailing-slash normalization
      {
        source: '/parts/attachments/forks/',
        destination: '/forks',
        permanent: true // 301 - Direct to final destination (roboticsandautomationnews.com DR72)
      },
      {
        source: '/parts/attachments/forks',
        destination: '/forks',
        permanent: true // 301 redirect - consolidates SEO authority
      },
      // Redirect non-existent attachment category pages to main parts catalog
      {
        source: '/parts/attachments/rotators',
        destination: '/parts',
        permanent: true
      },
      {
        source: '/parts/attachments/side-shifters',
        destination: '/parts',
        permanent: true
      },
      {
        source: '/parts/attachments/push-pull',
        destination: '/parts',
        permanent: true
      },
      {
        source: '/parts/attachments/specialized',
        destination: '/parts',
        permanent: true
      },
      {
        source: '/parts/attachments/clamps',
        destination: '/parts',
        permanent: true
      },
      // Remove demo content
      {
        source: '/insights/hello-world',
        destination: '/insights',
        permanent: true
      },
      // Redirect specific uncategorized articles that don't exist in insights
      // This article is linked from several MDX files but content was never migrated
      {
        source: '/uncategorized/maximizing-forklift-efficiency-maintenance-guide',
        destination: '/insights',
        permanent: true // Redirect to insights index since article doesn't exist
      },
      // BACKLINK RECOVERY: DR70+ external site links to this URL (constructionreviewonline.com)
      // Redirect to relevant live page to capture link equity
      {
        source: '/uncategorized/future-green-material-handling',
        destination: '/insights/future-green-material-handling',
        permanent: true // 301 - Recovers backlink authority from high-DR referrers
      },
      {
        source: '/insights/maximizing-forklift-efficiency-maintenance-guide',
        destination: '/insights',
        permanent: true // Also redirect the insights path in case of cached links
      },
      // Redirect old WordPress /uncategorized/ URLs to /insights/
      // These blog posts were migrated from WordPress where they lived under /uncategorized/
      {
        source: '/uncategorized/:slug',
        destination: '/insights/:slug',
        permanent: true // 301 redirect - preserves SEO and request method
      },
      // Also redirect the uncategorized index page
      {
        source: '/uncategorized',
        destination: '/insights',
        permanent: true
      },
      
      // ============================================================
      // DUPLICATE CONTENT CONSOLIDATION (Added 2026-01-09)
      // Redirect duplicate pages to canonical URLs to fix SEO cannibalization
      // These redirects address the "3XX page receives organic traffic" Site Audit issue
      // ============================================================
      
      // 1. Toyota A5-1 Error Code - Keep diagnostic-codes, redirect insights
      {
        source: '/insights/toyota-forklift-error-code-e-a5-1',
        destination: '/diagnostic-codes/e-a5-1-code-on-toyota-forklift-2',
        permanent: true // 301 - Consolidates ranking authority
      },
      
      // 2-3. Raymond Serial Number - Keep /raymond-serial-number-lookup, redirect duplicates
      {
        source: '/parts/raymond-forklift-serial-number',
        destination: '/raymond-serial-number-lookup',
        permanent: true
      },
      {
        source: '/insights/raymond-forklift-serial-number',
        destination: '/raymond-serial-number-lookup',
        permanent: true
      },
      
      // 4. Hyster Fault Codes - Keep brand hub, redirect rental path
      {
        source: '/rental/forklifts/hyster-forklift-fault-codes-list',
        destination: '/brand/hyster/fault-codes',
        permanent: true
      },
      
      // 5. Hyster Serial Number - Keep brand hub, redirect rental path
      {
        source: '/rental/forklifts/hyster-serial-number-lookup',
        destination: '/brand/hyster/serial-lookup',
        permanent: true
      },
      
      // 6. JCB Battery Location - Keep rental (top performer), redirect insights
      {
        source: '/insights/jcb-telehandler-battery-location',
        destination: '/rental/telehandler/jcb-telehandler-battery-location',
        permanent: true
      },
      
      // 7-8. JCB Fault Codes - Keep brand hub, redirect rental and insights
      {
        source: '/rental/telehandler/jcb-telehandler-fault-codes-list',
        destination: '/brand/jcb/fault-codes',
        permanent: true
      },
      {
        source: '/insights/jcb-telehandler-fault-codes-list',
        destination: '/brand/jcb/fault-codes',
        permanent: true
      },
      
      // 9. JCB Joystick Controls - Keep insights, redirect rental
      {
        source: '/rental/telehandler/jcb-telehandler-joystick-controls',
        destination: '/insights/jcb-telehandler-joystick-controls',
        permanent: true
      },
      
      // 10. Forklift Certification Duration - Keep insights, redirect rental
      {
        source: '/rental/forklifts/how-long-is-forklift-certification-good-for',
        destination: '/insights/how-long-is-forklift-certification-good-for',
        permanent: true
      },
      
      // 11. Forklift Age Requirement - Keep insights, redirect rental
      {
        source: '/rental/forklifts/how-old-must-you-be-to-operate-a-forklift-2',
        destination: '/insights/how-old-must-you-be-to-operate-a-forklift-2',
        permanent: true
      }
    ];
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https:",
      "media-src 'self' https: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https:"
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
        ]
      },
      {
        source: '/_next/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mzsozezflbhebykncbmr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.sandhills.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // NUCLEAR CACHE BUST: Force completely unique chunk hashes
  generateBuildId: async () => {
    const sha = process.env.VERCEL_GIT_COMMIT_SHA || 'local';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const env = process.env.NODE_ENV || 'development';
    console.log(`🔥 [NUCLEAR-CACHE-BUST] Build ID: SECURITY-${sha}-${timestamp}-${random}-${env}`);
    return `SECURITY-${sha}-${timestamp}-${random}-${env}`;
  },
  // Force webpack to regenerate all chunk names
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Force unique chunk names to prevent any possibility of reuse
      config.output.chunkFilename = `static/chunks/[name]-[contenthash:16]-${Date.now()}.js`;
      config.output.filename = `static/chunks/[name]-[contenthash:16]-${Date.now()}.js`;
      console.log(`🔥 [NUCLEAR-CACHE-BUST] Forcing unique chunk filenames with timestamp: ${Date.now()}`);
    }
    return config;
  }
};

export default withAnalyzer(withMDX(baseConfig));
