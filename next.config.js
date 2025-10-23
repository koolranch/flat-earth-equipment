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
  async redirects() {
    return [
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
      // Remove demo content
      {
        source: '/insights/hello-world',
        destination: '/insights',
        permanent: true
      },
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.flatearthequipment.com' }],
        destination: 'https://flatearthequipment.com/:path*',
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
