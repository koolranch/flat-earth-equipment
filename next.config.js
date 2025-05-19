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
      // Example redirects for parts
      { source: '/parts/Old-Slug', destination: '/parts/new-slug', permanent: true },
      { source: '/parts/another-old-slug', destination: '/parts/another-new-slug', permanent: true },
      // Add more redirects as needed
    ]
  },
}

export default nextConfig 