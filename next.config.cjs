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
      {
        source: '/diagnostic-codes/e-a5-1-code-on-toyota-forklift-2',
        destination: '/insights/e-a5-1-code-on-toyota-forklift-2',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/your-bobcat-serial-number-how-to-find-and-use-it',
        destination: '/insights/your-bobcat-serial-number-how-to-find-and-use-it',
        permanent: true,
      },
      {
        source: '/parts/aerial-equipment/genie-scissor-lift-error-codes',
        destination: '/insights/genie-scissor-lift-error-codes',
        permanent: true,
      },
      {
        source: '/rental/telehandler/jcb-telehandler-battery-location',
        destination: '/insights/jcb-telehandler-battery-location',
        permanent: true,
      },
      {
        source: '/rental/forklifts/hyster-serial-number-lookup',
        destination: '/insights/hyster-serial-number-lookup',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/new-holland-skid-steer-serial-number-lookup',
        destination: '/insights/new-holland-skid-steer-serial-number-lookup',
        permanent: true,
      },
      {
        source: '/construction-equipment/do-skid-steers-have-titles',
        destination: '/insights/do-skid-steers-have-titles',
        permanent: true,
      },
      {
        source: '/rental/forklifts/hyster-forklift-fault-codes-list',
        destination: '/insights/hyster-forklift-fault-codes-list',
        permanent: true,
      },
      {
        source: '/diagnostic-codes/cat-forklift-fault-codes',
        destination: '/insights/cat-forklift-fault-codes',
        permanent: true,
      },
      {
        source: '/rental/telehandler/jcb-telehandler-fault-codes-list',
        destination: '/insights/jcb-telehandler-fault-codes-list',
        permanent: true,
      },
      {
        source: '/parts/toyota-forklift-year-by-serial-number',
        destination: '/insights/toyota-forklift-year-by-serial-number',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/case-loader-serial-number-lookup',
        destination: '/insights/case-loader-serial-number-lookup',
        permanent: true,
      },
      {
        source: '/diagnostic-codes/e43-code-nissan-forklift',
        destination: '/insights/e43-code-nissan-forklift',
        permanent: true,
      },
      {
        source: '/parts/forklift-parts/nissan-k21-forklift-engine',
        destination: '/insights/nissan-k21-forklift-engine',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/gehl-serial-number-lookup',
        destination: '/insights/gehl-serial-number-lookup',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/jcb-backhoe-serial-number-lookup',
        destination: '/insights/jcb-backhoe-serial-number-lookup',
        permanent: true,
      },
      {
        source: '/rental/telehandler/jcb-telehandler-joystick-controls',
        destination: '/insights/jcb-telehandler-joystick-controls',
        permanent: true,
      },
      {
        source: '/rental/jcb-telehandler-models',
        destination: '/insights/jcb-telehandler-models',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/jcb-telehandler-cabin-filter-location',
        destination: '/insights/jcb-telehandler-cabin-filter-location',
        permanent: true,
      },
      {
        source: '/parts/raymond-forklift-serial-number',
        destination: '/insights/raymond-forklift-serial-number',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/jcb-parts-by-serial-number',
        destination: '/insights/jcb-parts-by-serial-number',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/john-deere-skid-steer-product-identification-number-lookup',
        destination: '/insights/john-deere-skid-steer-product-identification-number-lookup',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/jcb-3cx-serial-numbers',
        destination: '/insights/jcb-3cx-serial-numbers',
        permanent: true,
      },
      {
        source: '/attachments/forklift-forks/forklift-forks-class-3',
        destination: '/insights/forklift-forks-class-3',
        permanent: true,
      },
      {
        source: '/construction-equipment/case-1840-specs',
        destination: '/insights/case-1840-specs',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/jcb-1400b-serial-number',
        destination: '/insights/jcb-1400b-serial-number',
        permanent: true,
      },
      {
        source: '/rental/forklifts/how-long-is-forklift-certification-good-for',
        destination: '/insights/how-long-is-forklift-certification-good-for',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/jcb-excavator-serial-number-location',
        destination: '/insights/jcb-excavator-serial-number-location',
        permanent: true,
      },
      {
        source: '/cheyenne-wy',
        destination: '/insights/cheyenne-wy',
        permanent: true,
      },
      {
        source: '/parts/forklift-propane-tank',
        destination: '/insights/forklift-propane-tank',
        permanent: true,
      },
      {
        source: '/attachments/forklift-forks/what-are-forklift-forks-made-of-2',
        destination: '/insights/what-are-forklift-forks-made-of-2',
        permanent: true,
      },
      {
        source: '/attachments/forks-for-a-backhoe',
        destination: '/insights/forks-for-a-backhoe',
        permanent: true,
      },
      {
        source: '/pueblo-colorado',
        destination: '/insights/pueblo-colorado',
        permanent: true,
      },
      {
        source: '/rental/forklifts/how-old-must-you-be-to-operate-a-forklift-2',
        destination: '/insights/how-old-must-you-be-to-operate-a-forklift-2',
        permanent: true,
      },
      {
        source: '/parts/nissan-forklift-idle-circuit',
        destination: '/insights/nissan-forklift-idle-circuit',
        permanent: true,
      },
      {
        source: '/parts/mitsubishi-fg25n-engine',
        destination: '/insights/mitsubishi-fg25n-engine',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-iii-std-taper-72-x-6-x-2',
        destination: '/insights/forklift-forks-class-iii-std-taper-72-x-6-x-2',
        permanent: true,
      },
      {
        source: '/parts/cat-p5000-e31-error-code',
        destination: '/insights/cat-p5000-e31-error-code',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-ii-std-taper-72-x-5-x-1-75',
        destination: '/insights/forklift-forks-class-ii-std-taper-72-x-5-x-1-75',
        permanent: true,
      },
      {
        source: '/rental/jlg-t350',
        destination: '/insights/jlg-t350',
        permanent: true,
      },
      {
        source: '/hyster',
        destination: '/insights/hyster',
        permanent: true,
      },
      {
        source: '/battery-charger-modules',
        destination: '/insights/battery-charger-modules',
        permanent: true,
      },
      {
        source: '/rental/construction-equipment-rental/what-is-the-fuel-capacity-of-a-746b-bobcat',
        destination: '/insights/what-is-the-fuel-capacity-of-a-746b-bobcat',
        permanent: true,
      },
      {
        source: '/rental/telehandler/wyoming-telehandler-rental',
        destination: '/insights/wyoming-telehandler-rental',
        permanent: true,
      },
      {
        source: '/parts/forklift-parts/2000-12-can-bus-code-2',
        destination: '/insights/2000-12-can-bus-code-2',
        permanent: true,
      },
      {
        source: '/parts/forklift-parts/ty53720-u2231-71',
        destination: '/insights/ty53720-u2231-71',
        permanent: true,
      },
      {
        source: '/undercarriage-parts',
        destination: '/insights/undercarriage-parts',
        permanent: true,
      },
      {
        source: '/excavator-parts',
        destination: '/insights/excavator-parts',
        permanent: true,
      },
      {
        source: '/construction-equipment-parts',
        destination: '/insights/construction-equipment-parts',
        permanent: true,
      },
      {
        source: '/tracks-and-tires',
        destination: '/insights/tracks-and-tires',
        permanent: true,
      },
      {
        source: '/carpet-poles',
        destination: '/insights/carpet-poles',
        permanent: true,
      },
      {
        source: '/daily-rentals',
        destination: '/insights/daily-rentals',
        permanent: true,
      },
      {
        source: '/attachments/forklift-forks/shaft-mounted-forks',
        destination: '/insights/shaft-mounted-forks',
        permanent: true,
      },
      {
        source: '/rental/john-deere-320-skid-steer',
        destination: '/insights/john-deere-320-skid-steer',
        permanent: true,
      },
      {
        source: '/product/toyota-seat-53720-u223171',
        destination: '/insights/toyota-seat-53720-u223171',
        permanent: true,
      },
      {
        source: '/attachments/forklift-side-shifter',
        destination: '/insights/forklift-side-shifter',
        permanent: true,
      },
      {
        source: '/toro',
        destination: '/insights/toro',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-iii-std-taper-48-x-6-x-2',
        destination: '/insights/forklift-forks-class-iii-std-taper-48-x-6-x-2',
        permanent: true,
      },
      {
        source: '/parts/forklift-parts/seats-2',
        destination: '/insights/seats-2',
        permanent: true,
      },
      {
        source: '/product/cat-91a1431010-vinyl-suspension-seat',
        destination: '/insights/cat-91a1431010-vinyl-suspension-seat',
        permanent: true,
      },
      {
        source: '/rental/construction-equipment-rental/john-deere-250-skid-steer',
        destination: '/insights/john-deere-250-skid-steer',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/jcb-telehandler-serial-number-location-2',
        destination: '/insights/jcb-telehandler-serial-number-location-2',
        permanent: true,
      },
      {
        source: '/by-brand',
        destination: '/insights/by-brand',
        permanent: true,
      },
      {
        source: '/heli',
        destination: '/insights/heli',
        permanent: true,
      },
      {
        source: '/parts/cat-p5000-throttle-control-switch-troubleshooting',
        destination: '/insights/cat-p5000-throttle-control-switch-troubleshooting',
        permanent: true,
      },
      {
        source: '/parts/attachments/forks',
        destination: '/insights/forks',
        permanent: true,
      },
      {
        source: '/las-cruces-new-mexico',
        destination: '/insights/las-cruces-new-mexico',
        permanent: true,
      },
      {
        source: '/rental/landscaping-equipment/toro-dingo-tx427',
        destination: '/insights/toro-dingo-tx427',
        permanent: true,
      },
      {
        source: '/skid-steer-loaders',
        destination: '/insights/skid-steer-loaders',
        permanent: true,
      },
      {
        source: '/attachments/forklift-forks/bent-forklift-forks',
        destination: '/insights/bent-forklift-forks',
        permanent: true,
      },
      {
        source: '/parts/attachments/sideshifts',
        destination: '/insights/sideshifts',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-iii-std-taper-42-x-5-x-2',
        destination: '/insights/forklift-forks-class-iii-std-taper-42-x-5-x-2',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-ii-std-taper-48-x-4-x-1-75',
        destination: '/insights/forklift-forks-class-ii-std-taper-48-x-4-x-1-75',
        permanent: true,
      },
      {
        source: '/rental/aerial-lifts/jlg-450aj',
        destination: '/insights/jlg-450aj',
        permanent: true,
      },
      {
        source: '/sinoboom',
        destination: '/insights/sinoboom',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-ii-std-taper-72-x-4-x-1-75',
        destination: '/insights/forklift-forks-class-ii-std-taper-72-x-4-x-1-75',
        permanent: true,
      },
      {
        source: '/bozeman-mt',
        destination: '/insights/bozeman-mt',
        permanent: true,
      },
      {
        source: '/parts/aerial-equipment/jlg-1600292-controller',
        destination: '/insights/jlg-1600292-controller',
        permanent: true,
      },
      {
        source: '/rental/forklifts/importance-forklift-chains-maintenance-safety',
        destination: '/insights/importance-forklift-chains-maintenance-safety',
        permanent: true,
      },
      {
        source: '/forklift-battery-chargers',
        destination: '/insights/forklift-battery-chargers',
        permanent: true,
      },
      {
        source: '/location',
        destination: '/insights/location',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-iv-std-taper-60-x-6-x-2-5',
        destination: '/insights/forklift-forks-class-iv-std-taper-60-x-6-x-2-5',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-iii-std-taper-72-x-5-x-2',
        destination: '/insights/forklift-forks-class-iii-std-taper-72-x-5-x-2',
        permanent: true,
      },
      {
        source: '/product/forklift-charger-module-6la20671',
        destination: '/insights/forklift-charger-module-6la20671',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-ii-std-taper-42-x-5-x-1-75',
        destination: '/insights/forklift-forks-class-ii-std-taper-42-x-5-x-1-75',
        permanent: true,
      },
      {
        source: '/product/toyota-seat-assembly-53730-u117071',
        destination: '/insights/toyota-seat-assembly-53730-u117071',
        permanent: true,
      },
      {
        source: '/parts/construction-equipment-parts/jcb-engine-serial-number-lookup',
        destination: '/insights/jcb-engine-serial-number-lookup',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-ii-std-taper-48-x-5-x-1-75',
        destination: '/insights/forklift-forks-class-ii-std-taper-48-x-5-x-1-75',
        permanent: true,
      },
      {
        source: '/parts/forklift-parts/tires',
        destination: '/insights/tires',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-ii-std-taper-54-x-5-x-1-75',
        destination: '/insights/forklift-forks-class-ii-std-taper-54-x-5-x-1-75',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-iii-std-taper-96-x-5-x-2',
        destination: '/insights/forklift-forks-class-iii-std-taper-96-x-5-x-2',
        permanent: true,
      },
      {
        source: '/rental',
        destination: '/insights/rental',
        permanent: true,
      },
      {
        source: '/product/forklift-forks-class-iv-std-taper-48-x-6-x-2-5',
        destination: '/insights/forklift-forks-class-iv-std-taper-48-x-6-x-2-5',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig; 