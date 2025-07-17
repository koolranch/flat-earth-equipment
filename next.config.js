/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localeDetection: false           // we'll do soft-redirects manually
  },
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
  async redirects() {
    return [
      // Marketing URL → canonical safety slug
      {
        source: '/training/forklift-operator-certification',
        destination: '/safety',
        permanent: true,
      },
      // future courses: copy pattern ↓
      // { source: '/training/battery-safety', destination: '/safety/battery', permanent: true },
      
      // Add the new redirect for forks
      {
        source: '/parts/attachments/forks',
        destination: '/parts?category=Forks',
        permanent: true,
      },
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
      // Add the new redirect for the old URL
      {
        source: '/parts/forklift-charger-module-6la20671',
        destination: '/parts/enersys-forklift-charger-module-6la20671',
        permanent: true,
      },
      // Direct redirect to the optimized charger modules landing page
      {
        source: '/battery-charger-modules',
        destination: '/charger-modules',
        permanent: true,
      },
      // EV Charger redirects to new landing page
      {
        source: '/ev-chargers',
        destination: '/electric-vehicle-chargers',
        permanent: true,
      },
      {
        source: '/electric-car-chargers',
        destination: '/electric-vehicle-chargers',
        permanent: true,
      },
      {
        source: '/level-2-chargers',
        destination: '/electric-vehicle-chargers',
        permanent: true,
      },
      {
        source: '/chargepoint-chargers',
        destination: '/electric-vehicle-chargers',
        permanent: true,
      },
      // Spanish EV Charger redirects to main bilingual page
      {
        source: '/cargadores-ev',
        destination: '/electric-vehicle-chargers',
        permanent: true,
      },
      {
        source: '/cargadores-electricos',
        destination: '/electric-vehicle-chargers',
        permanent: true,
      },
      {
        source: '/cargadores-vehiculos-electricos',
        destination: '/electric-vehicle-chargers',
        permanent: true,
      },
      {
        source: '/cargadores-autos-electricos',
        destination: '/electric-vehicle-chargers',
        permanent: true,
      },
      {
        source: '/estaciones-carga-ev',
        destination: '/electric-vehicle-chargers',
        permanent: true,
      },
      {
        source: '/cargadores-nivel-2',
        destination: '/electric-vehicle-chargers',
        permanent: true,
      },
      // Toyota seat assembly redirect
      {
        source: '/parts/toyota-seat-assembly-53730-u117071',
        destination: '/parts/toyota-seat-assembly-cloth-53730-u117071',
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