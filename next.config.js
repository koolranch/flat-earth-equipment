/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    // Turn off strict route-props type checking
    typedRoutes: false,
  },
};

module.exports = nextConfig; 