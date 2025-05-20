/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mzsozezflbhebykncbmr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  async redirects() {
    return [
      // Generic catch-all: /product/old-slug → /parts/old-slug
      {
        source: '/product/:slug',
        destination: '/parts/:slug',
        permanent: true,
      },
      // Specific mapping for enersys charger module
      {
        source: '/product/forklift-charger-module-6la20671',
        destination: '/parts/enersys-forklift-charger-module-6la20671',
        permanent: true,
      },
      // Example redirects for parts
      { source: '/parts/Old-Slug', destination: '/parts/new-slug', permanent: true },
      { source: '/parts/another-old-slug', destination: '/parts/another-new-slug', permanent: true },
      // Add more redirects as needed
    ]
  },
}

export default nextConfig 