// next.config.js
import bundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === '1' });

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  cleanDistDir: true,
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next dev needs inline/eval; tighten later
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'self'",
    ].join('; ');
    
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy-Report-Only', value: csp }
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

export default withAnalyzer(baseConfig);
