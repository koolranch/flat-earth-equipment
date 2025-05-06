/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable the new App Router in Next.js 15+
  appDir: true,

  typescript: {
    ignoreBuildErrors: true, // allow production build despite type errors
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/photo-*/**',
      },
    ],
  },
};

module.exports = nextConfig; 