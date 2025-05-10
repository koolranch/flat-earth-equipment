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
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  async redirects() {
    return [
      {
        source: '/blog/aerial-lift-certification',
        destination: '/insights/aerial-lift-certification',
        permanent: true,
      },
      {
        source: '/blog/fork-extensions-for-forklifts',
        destination: '/insights/fork-extensions-for-forklifts',
        permanent: true,
      },
      {
        source: '/blog/what-are-forklift-forks-made-of',
        destination: '/insights/what-are-forklift-forks-made-of-2',
        permanent: true,
      },
      {
        source: '/blog/mewp-certification',
        destination: '/insights/mewp-certification',
        permanent: true,
      },
      {
        source: '/blog/new-holland-skid-steer-serial-number-lookup',
        destination: '/insights/new-holland-skid-steer-serial-number-lookup',
        permanent: true,
      },
      {
        source: '/blog/jlg-0060048s-actuator',
        destination: '/insights/jlg-0060048s-actuator',
        permanent: true,
      },
      {
        source: '/blog/ep-forklifts',
        destination: '/insights/ep-forklifts',
        permanent: true,
      },
      {
        source: '/blog/genie-1256727gt-joystick',
        destination: '/insights/genie-1256727gt-joystick',
        permanent: true,
      },
      {
        source: '/blog/john-deere-skid-steer-serial-number-lookup',
        destination: '/insights/john-deere-skid-steer-serial-number-lookup',
        permanent: true,
      },
      {
        source: '/blog/toyota-forklift-error-code-e-a5-1',
        destination: '/insights/toyota-forklift-error-code-e-a5-1',
        permanent: true,
      },
      {
        source: '/blog/jcb-3cx-serial-numbers',
        destination: '/insights/jcb-3cx-serial-numbers',
        permanent: true,
      },
      {
        source: '/blog/importance-forklift-chains-maintenance-safety',
        destination: '/insights/importance-forklift-chains-maintenance-safety',
        permanent: true,
      },
      {
        source: '/blog/forklift-forks',
        destination: '/insights/forklift-forks',
        permanent: true,
      },
      {
        source: '/blog/forklift-daily-inspection-checklist',
        destination: '/insights/forklift-daily-inspection-checklist',
        permanent: true,
      },
      {
        source: '/blog/enhancing-forklift-safety-camera-systems',
        destination: '/insights/enhancing-forklift-safety-camera-systems',
        permanent: true,
      },
      {
        source: '/blog/future-green-material-handling',
        destination: '/insights/future-green-material-handling',
        permanent: true,
      },
      {
        source: '/blog/enhancing-forklift-performance-aftermarket-parts',
        destination: '/insights/enhancing-forklift-performance-aftermarket-parts',
        permanent: true,
      },
      {
        source: '/blog/maximizing-efficiency-on-your-site-with-toro-buggy-parts',
        destination: '/insights/maximizing-efficiency-on-your-site-with-toro-buggy-parts',
        permanent: true,
      },
      {
        source: '/blog/forklift-parts-cold-storage-guide',
        destination: '/insights/forklift-parts-cold-storage-guide',
        permanent: true,
      },
      {
        source: '/blog/enhancing-forklift-safety-tech',
        destination: '/insights/enhancing-forklift-safety-tech',
        permanent: true,
      },
      {
        source: '/blog/hello-world',
        destination: '/insights/hello-world',
        permanent: true,
      },
      {
        source: '/blog/zoomlion-excavator-specs',
        destination: '/insights/zoomlion-excavator-specs',
        permanent: true,
      },
      {
        source: '/blog/zoomlion',
        destination: '/insights/zoomlion',
        permanent: true,
      },
      {
        source: '/blog/genie-fault-code-2000-12',
        destination: '/insights/genie-fault-code-2000-12',
        permanent: true,
      },
      {
        source: '/blog/how-old-must-you-be-to-operate-a-forklift',
        destination: '/insights/how-old-must-you-be-to-operate-a-forklift',
        permanent: true,
      },
      {
        source: '/blog/forklift-safety-standards-ohio',
        destination: '/insights/forklift-safety-standards-ohio',
        permanent: true,
      },
      {
        source: '/blog/replacement-forklift-forks',
        destination: '/insights/replacement-forklift-forks',
        permanent: true,
      },
      {
        source: '/blog/hyster-1688643-8-00-20-wheel-rim',
        destination: '/insights/hyster-1688643-8-00-20-wheel-rim',
        permanent: true,
      },
      {
        source: '/blog/forks-lumber-wyoming-2',
        destination: '/insights/forks-lumber-wyoming-2',
        permanent: true,
      },
      {
        source: '/blog/forklift-lumber-forks',
        destination: '/insights/forklift-lumber-forks',
        permanent: true,
      },
      {
        source: '/blog/carpet-poles-for-forklifts',
        destination: '/insights/carpet-poles-for-forklifts',
        permanent: true,
      },
      {
        source: '/blog/warehouse-equipment-forklift-parts',
        destination: '/insights/warehouse-equipment-forklift-parts',
        permanent: true,
      },
      {
        source: '/blog/forklift-repair-parts-ohio',
        destination: '/insights/forklift-repair-parts-ohio',
        permanent: true,
      },
      {
        source: '/blog/jcb-excavator-serial-number-location',
        destination: '/insights/jcb-excavator-serial-number-location',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig; 