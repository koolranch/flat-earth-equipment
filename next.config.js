/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mzsozezflbhebykncbmr.supabase.co'],
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

module.exports = nextConfig 