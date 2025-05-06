/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Turn off strict route-props type checking
    typedRoutes: false,
  },
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