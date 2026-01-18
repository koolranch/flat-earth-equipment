/**
 * IndexNow Bulk URL Submission Script
 * 
 * Submits URLs to search engines via IndexNow protocol for faster indexing.
 * Supported engines: Bing, Yandex, Seznam, Naver
 * 
 * Usage: npx tsx scripts/submit-indexnow.ts
 */

const INDEXNOW_KEY = 'e8f4a2b1c9d7e5f3';
const HOST = 'www.flatearthequipment.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

// URLs extracted from Ahrefs "pages to submit" export
const URLS_TO_SUBMIT = [
  'https://www.flatearthequipment.com/',
  'https://www.flatearthequipment.com/legal/privacy',
  'https://www.flatearthequipment.com/locations',
  'https://www.flatearthequipment.com/texas/dallas-fort-worth',
  'https://www.flatearthequipment.com/legal/terms',
  'https://www.flatearthequipment.com/insights',
  'https://www.flatearthequipment.com/brand/toyota/fault-codes',
  'https://www.flatearthequipment.com/hyster-serial-number-lookup',
  'https://www.flatearthequipment.com/brand/doosan/fault-codes',
  'https://www.flatearthequipment.com/new-holland-serial-number-lookup',
  'https://www.flatearthequipment.com/brand/toyota/guide',
  'https://www.flatearthequipment.com/electric-vehicle-chargers',
  'https://www.flatearthequipment.com/trainer',
  'https://www.flatearthequipment.com/forks',
  'https://www.flatearthequipment.com/charger-modules',
  'https://www.flatearthequipment.com/insights/how-old-must-you-be-to-operate-a-forklift-2',
  'https://www.flatearthequipment.com/insights/shaft-mounted-forks',
  'https://www.flatearthequipment.com/brand/john-deere/fault-codes',
  'https://www.flatearthequipment.com/insights/troubleshooting-jcb-535-125-hydraulic-functions-cutting-out',
  'https://www.flatearthequipment.com/brand/lcmg/fault-codes',
  'https://www.flatearthequipment.com/insights/forklift-certification-requirements',
  'https://www.flatearthequipment.com/brand/jungheinrich/fault-codes',
  'https://www.flatearthequipment.com/insights/joystick-codes',
  'https://www.flatearthequipment.com/insights/safety-training-course',
  'https://www.flatearthequipment.com/insights/forklift-operator-safety-training',
  'https://www.flatearthequipment.com/insights/jcb-immobilizer-bypass-keypad-code-reset-procedure',
  'https://www.flatearthequipment.com/brand/unicarriers/fault-codes',
  'https://www.flatearthequipment.com/es/brand/cat/fault-codes',
  'https://www.flatearthequipment.com/takeuchi-serial-number-lookup',
  'https://www.flatearthequipment.com/insights/best-lithium-batteries-for-golf-carts',
  'https://www.flatearthequipment.com/es/brand/yale/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-telehandler-parking-brake-pad-replacement-15-920284',
  'https://www.flatearthequipment.com/brand/clark/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-loadall-hydraulic-pump-cavitation-noise-and-power-loss',
  'https://www.flatearthequipment.com/insights/toyota-forklift-year-by-serial-number',
  'https://www.flatearthequipment.com/brand/snorkel/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-telehandler-models',
  'https://www.flatearthequipment.com/genie-serial-number-lookup',
  'https://www.flatearthequipment.com/insights/jlg-t350',
  'https://www.flatearthequipment.com/insights/forklift-training-classes',
  'https://www.flatearthequipment.com/es/brand/linde/fault-codes',
  'https://www.flatearthequipment.com/insights/complete-guide-forklift-battery-chargers',
  'https://www.flatearthequipment.com/insights/fork-extensions-for-forklifts',
  'https://www.flatearthequipment.com/es/brand/liugong/fault-codes',
  'https://www.flatearthequipment.com/es/brand/mitsubishi/fault-codes',
  'https://www.flatearthequipment.com/es/brand/skyjack/fault-codes',
  'https://www.flatearthequipment.com/insights/how-to-desulfate-batteries',
  'https://www.flatearthequipment.com/es/brand/doosan/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-3-cx-powershift-transmission-overheating-oil-cooler-flush',
  'https://www.flatearthequipment.com/es/brand/unicarriers/fault-codes',
  'https://www.flatearthequipment.com/insights/forklift-daily-inspection-checklist',
  'https://www.flatearthequipment.com/insights/jcb-telehandler-parking-brake-stuck-on-solenoid-release-guide',
  'https://www.flatearthequipment.com/insights/jcb-p-0087-fuel-rail-pressure-low-scv-valve-diagnosis',
  'https://www.flatearthequipment.com/insights/jcb-telehandler-cabin-filter-location',
  'https://www.flatearthequipment.com/es/brand/raymond/fault-codes',
  'https://www.flatearthequipment.com/brand/jlg/fault-codes',
  'https://www.flatearthequipment.com/insights/cat-p5000-throttle-control-switch-troubleshooting',
  'https://www.flatearthequipment.com/insights/how-much-is-a-forklift-license',
  'https://www.flatearthequipment.com/insights/case-1840-specs',
  'https://www.flatearthequipment.com/brand/case/fault-codes',
  'https://www.flatearthequipment.com/insights/forklift-side-shifter',
  'https://www.flatearthequipment.com/insights/electric-pallet-jack-certification',
  'https://www.flatearthequipment.com/insights/jcb-parts-by-serial-number',
  'https://www.flatearthequipment.com/brand/liugong/fault-codes',
  'https://www.flatearthequipment.com/brand/hyster/fault-codes',
  'https://www.flatearthequipment.com/insights/osha-standard-for-forklift-training',
  'https://www.flatearthequipment.com/es/brand/xcmg/fault-codes',
  'https://www.flatearthequipment.com/brand/linde/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-loadall-wont-start-immobilizer-and-keypad-bypass',
  'https://www.flatearthequipment.com/insights/jcb-ad-blue-def-crystallization-cleaning-and-pump-replacement',
  'https://www.flatearthequipment.com/insights/how-to-become-a-forklift-operator',
  'https://www.flatearthequipment.com/insights/the-real-cause-of-most-forklift-accidents-operator-error-and-inadequate-training',
  'https://www.flatearthequipment.com/insights/john-deere-320-skid-steer',
  'https://www.flatearthequipment.com/insights/bent-forklift-forks',
  'https://www.flatearthequipment.com/insights/dc-to-dc-converter-48-v-to-12-v',
  'https://www.flatearthequipment.com/insights/mobile-elevating-work-platform-training',
  'https://www.flatearthequipment.com/insights/jcb-3cx-serial-numbers',
  'https://www.flatearthequipment.com/insights/jaltest-vs-cat-et-for-skid-steers',
  'https://www.flatearthequipment.com/insights/how-long-is-forklift-certification-good-for',
  'https://www.flatearthequipment.com/insights/hyster-forklift-fault-codes-list',
  'https://www.flatearthequipment.com/es/brand/hyster/fault-codes',
  'https://www.flatearthequipment.com/insights/maximizing-efficiency-on-your-site-with-toro-buggy-parts',
  'https://www.flatearthequipment.com/insights/jlg-1600292-controller',
  'https://www.flatearthequipment.com/insights/osha-forklift-inspection-checklist',
  'https://www.flatearthequipment.com/insights/jcb-quick-hitch-solenoid-valve-testing-and-bypass',
  'https://www.flatearthequipment.com/insights/fast-vs-overnight-forklift-charging',
  'https://www.flatearthequipment.com/insights/john-deere-skid-steer-serial-number-lookup',
  'https://www.flatearthequipment.com/insights/best-diagnostic-scanner-for-mixed-construction-fleet',
  'https://www.flatearthequipment.com/es/brand/bobcat/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-1400b-serial-number',
  'https://www.flatearthequipment.com/insights/jlg-0060048s-actuator',
  'https://www.flatearthequipment.com/insights/jcb-js-220-track-motor-floating-seal-replacement-guide',
  'https://www.flatearthequipment.com/insights/jcb-p-0087-fuel-rail-pressure-too-low-scv-valve-diagnosis',
  'https://www.flatearthequipment.com/insights/forklift-lumber-forks',
  'https://www.flatearthequipment.com/brand/crown/fault-codes',
  'https://www.flatearthequipment.com/insights/cat-forklift-fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-js-excavator-slew-motor-gearbox-oil-leak-repair',
  'https://www.flatearthequipment.com/insights/mewp-certification',
  'https://www.flatearthequipment.com/insights/wyoming-telehandler-rental',
  'https://www.flatearthequipment.com/insights/jcb-service-master-fault-codes-list-and-manual-reset',
  'https://www.flatearthequipment.com/insights/lithium-forklift-battery-chargers-complete-guide',
  'https://www.flatearthequipment.com/insights/36-v-to-12-v-voltage-converter',
  'https://www.flatearthequipment.com/insights/forklift-charger-module-supplier',
  'https://www.flatearthequipment.com/insights/forks-lumber-wyoming-2',
  'https://www.flatearthequipment.com/brand/skyjack/fault-codes',
  'https://www.flatearthequipment.com/es/brand/new-holland/fault-codes',
  'https://www.flatearthequipment.com/es/brand/tennant/fault-codes',
  'https://www.flatearthequipment.com/insights/genie-scissor-lift-error-codes',
  'https://www.flatearthequipment.com/insights/future-green-material-handling',
  'https://www.flatearthequipment.com/insights/do-skid-steers-have-titles',
  'https://www.flatearthequipment.com/insights/what-are-forklift-forks-made-of-2',
  'https://www.flatearthequipment.com/brand/skytrak/fault-codes',
  'https://www.flatearthequipment.com/insights/forklift-aerial-platforms',
  'https://www.flatearthequipment.com/insights/forklift-fork-sizes',
  'https://www.flatearthequipment.com/insights/telehandler-rental-rates',
  'https://www.flatearthequipment.com/es/brand/snorkel/fault-codes',
  'https://www.flatearthequipment.com/insights/lead-acid-vs-lithium-forklift-chargers',
  'https://www.flatearthequipment.com/insights/forklift-truck-charger',
  'https://www.flatearthequipment.com/bobcat-serial-number-lookup',
  'https://www.flatearthequipment.com/insights/forklift-training-requirements',
  'https://www.flatearthequipment.com/insights/jcb-3-cx-steering-mode-switch-fault-crab-steer-fix',
  'https://www.flatearthequipment.com/es/brand/skytrak/fault-codes',
  'https://www.flatearthequipment.com/insights/e43-code-nissan-forklift',
  'https://www.flatearthequipment.com/insights/jcb-3-cx-backhoe-wont-move-forward-or-reverse-solenoid-fix',
  'https://www.flatearthequipment.com/insights/jcb-p-0107-atmospheric-pressure-sensor-location-and-swap',
  'https://www.flatearthequipment.com/insights/e-a5-1-code-on-toyota-forklift-2',
  'https://www.flatearthequipment.com/brand/bobcat/fault-codes',
  'https://www.flatearthequipment.com/insights/forklift-forks-class-3',
  'https://www.flatearthequipment.com/insights/replacing-jcb-telehandler-wear-pads-boom-extension-guide',
  'https://www.flatearthequipment.com/insights/hyster-serial-number-lookup',
  'https://www.flatearthequipment.com/insights/aerial-lift-inspection-checklist',
  'https://www.flatearthequipment.com/insights/jcb-p-0117-coolant-temperature-sensor-location-and-swap',
  'https://www.flatearthequipment.com/insights/hyster-1688643-8-00-20-wheel-rim',
  'https://www.flatearthequipment.com/insights/enhancing-forklift-safety-camera-systems',
  'https://www.flatearthequipment.com/brand/moffett/fault-codes',
  'https://www.flatearthequipment.com/brand/mitsubishi/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-4-cx-transmission-overheating-oil-cooler-and-filter-check',
  'https://www.flatearthequipment.com/insights/genie-1256727gt-joystick',
  'https://www.flatearthequipment.com/insights/forklift-battery-chargers',
  'https://www.flatearthequipment.com/insights/john-deere-250-skid-steer',
  'https://www.flatearthequipment.com/insights/forks-for-a-backhoe',
  'https://www.flatearthequipment.com/insights/replacement-forklift-forks',
  'https://www.flatearthequipment.com/brand/new-holland/fault-codes',
  'https://www.flatearthequipment.com/insights/zoomlion',
  'https://www.flatearthequipment.com/insights/genie-fault-code-2000-12',
  'https://www.flatearthequipment.com/es/brand/komatsu/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-3-cx-electrical-connector-corrosion-under-cab-fix',
  'https://www.flatearthequipment.com/brand/mec/fault-codes',
  'https://www.flatearthequipment.com/insights/ep-forklifts',
  'https://www.flatearthequipment.com/insights/what-is-a-scissor-lift-used-for',
  'https://www.flatearthequipment.com/insights/bms-integration-lithium-forklift-chargers',
  'https://www.flatearthequipment.com/es/brand/lcmg/fault-codes',
  'https://www.flatearthequipment.com/insights/charger-for-forklift',
  'https://www.flatearthequipment.com/es/brand/case/fault-codes',
  'https://www.flatearthequipment.com/brand/enersys/fault-codes',
  'https://www.flatearthequipment.com/insights/forklift-parts-online',
  'https://www.flatearthequipment.com/insights/gehl-serial-number-lookup',
  'https://www.flatearthequipment.com/es/brand/toyota/guide',
  'https://www.flatearthequipment.com/brand/heli/fault-codes',
  'https://www.flatearthequipment.com/insights/cat-p5000-e31-error-code',
  'https://www.flatearthequipment.com/insights/charging-electric-forklift',
  'https://www.flatearthequipment.com/brand/kubota/fault-codes',
  'https://www.flatearthequipment.com/insights/toro-dingo-tx427',
  'https://www.flatearthequipment.com/insights/nissan-forklift-idle-circuit',
  'https://www.flatearthequipment.com/insights/jcb-telehandler-ad-blue-system-faults-pump-vs-injector',
  'https://www.flatearthequipment.com/insights/jcb-ad-blue-injector-cleaning-guide-bosch-denoxtronic-system',
  'https://www.flatearthequipment.com/insights/forklift-charging-stations',
  'https://www.flatearthequipment.com/insights/jcb-excavator-throttle-motor-calibration-guide',
  'https://www.flatearthequipment.com/insights/carpet-poles-for-forklifts',
  'https://www.flatearthequipment.com/insights/forklift-and-pedestrian-safety',
  'https://www.flatearthequipment.com/es/brand/karcher/fault-codes',
  'https://www.flatearthequipment.com/brand/tcm/fault-codes',
  'https://www.flatearthequipment.com/brand/raymond/fault-codes',
  'https://www.flatearthequipment.com/es/brand/tcm/fault-codes',
  'https://www.flatearthequipment.com/brand/powerboss/fault-codes',
  'https://www.flatearthequipment.com/insights/aerial-lift-training',
  'https://www.flatearthequipment.com/insights/forklift-maintenance-checklist',
  'https://www.flatearthequipment.com/insights/forklift-operator-evaluation-form',
  'https://www.flatearthequipment.com/es/brand/moffett/fault-codes',
  'https://www.flatearthequipment.com/insights/battery-charger-for-golf-carts-36-v',
  'https://www.flatearthequipment.com/brand/tennant/fault-codes',
  'https://www.flatearthequipment.com/insights/12-volt-converter',
  'https://www.flatearthequipment.com/es/brand/john-deere/fault-codes',
  'https://www.flatearthequipment.com/brand/cat/fault-codes',
  'https://www.flatearthequipment.com/brand/tailift/fault-codes',
  'https://www.flatearthequipment.com/kubota-serial-number-lookup',
  'https://www.flatearthequipment.com/es/brand/jcb/fault-codes',
  'https://www.flatearthequipment.com/brand/xcmg/fault-codes',
  'https://www.flatearthequipment.com/es/brand/powerboss/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-fastrac-suspension-fault-codes-and-sensor-calibration',
  'https://www.flatearthequipment.com/brand/jcb/fault-codes',
  'https://www.flatearthequipment.com/insights/osha-forklift-trainer-requirements',
  'https://www.flatearthequipment.com/insights/forklift-charger-voltage-comparison',
  'https://www.flatearthequipment.com/es/brand/tailift/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-js-130-throttle-motor-calibration-and-replacement-steps',
  'https://www.flatearthequipment.com/insights/forklift-parts-cold-storage-guide',
  'https://www.flatearthequipment.com/insights/jcb-ad-blue-pump-failure-symptoms-and-replacement-cost',
  'https://www.flatearthequipment.com/brand/yale/fault-codes',
  'https://www.flatearthequipment.com/insights/electric-forklift-charging',
  'https://www.flatearthequipment.com/insights/how-to-get-a-forklift-license',
  'https://www.flatearthequipment.com/insights/your-bobcat-serial-number-how-to-find-and-use-it',
  'https://www.flatearthequipment.com/insights/aerial-lift-certification',
  'https://www.flatearthequipment.com/insights/forklift-osha-certification',
  'https://www.flatearthequipment.com/insights/forklift-forks',
  'https://www.flatearthequipment.com/insights/licencia-de-forklift',
  'https://www.flatearthequipment.com/es/brand/crown/fault-codes',
  'https://www.flatearthequipment.com/insights/24-volt-forklift-battery-charger',
  'https://www.flatearthequipment.com/insights/forklift-safety-standards-ohio',
  'https://www.flatearthequipment.com/brand/gehl/fault-codes',
  'https://www.flatearthequipment.com/insights/jlg-450aj',
  'https://www.flatearthequipment.com/insights/forklift-training-certificate-template',
  'https://www.flatearthequipment.com/es/brand/jungheinrich/fault-codes',
  'https://www.flatearthequipment.com/es/brand/heli/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-telehandler-joystick-controls',
  'https://www.flatearthequipment.com/insights/how-long-does-forklift-certification-take',
  'https://www.flatearthequipment.com/insights/how-to-choose-forklift-battery-charger',
  'https://www.flatearthequipment.com/es/brand/enersys/fault-codes',
  'https://www.flatearthequipment.com/es/brand/gehl/fault-codes',
  'https://www.flatearthequipment.com/brand/komatsu/fault-codes',
  'https://www.flatearthequipment.com/brand/takeuchi/fault-codes',
  'https://www.flatearthequipment.com/insights/john-deere-skid-steer-product-identification-number-lookup',
  'https://www.flatearthequipment.com/es/brand/kubota/fault-codes',
  'https://www.flatearthequipment.com/insights/enhancing-forklift-performance-aftermarket-parts',
  'https://www.flatearthequipment.com/es/brand/jlg/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-engine-serial-number-lookup',
  'https://www.flatearthequipment.com/insights/forklift-repair-parts-ohio',
  'https://www.flatearthequipment.com/insights/jcb-excavator-serial-number-location',
  'https://www.flatearthequipment.com/insights/safety-and-forklift-training',
  'https://www.flatearthequipment.com/insights/warehouse-equipment-forklift-parts',
  'https://www.flatearthequipment.com/insights/how-to-get-forklift-certified',
  'https://www.flatearthequipment.com/insights/what-is-the-fuel-capacity-of-a-746b-bobcat',
  'https://www.flatearthequipment.com/insights/zoomlion-excavator-specs',
  'https://www.flatearthequipment.com/insights/importance-forklift-chains-maintenance-safety',
  'https://www.flatearthequipment.com/es/brand/takeuchi/fault-codes',
  'https://www.flatearthequipment.com/insights/jcb-hydraulic-pump-noise-cavitation-vs-worn-bearings',
  'https://www.flatearthequipment.com/insights/jcb-telehandler-serial-number-location-2',
  'https://www.flatearthequipment.com/insights/enhancing-forklift-safety-tech',
  'https://www.flatearthequipment.com/es/brand/toyota/fault-codes',
  'https://www.flatearthequipment.com/brand/karcher/fault-codes',
  'https://www.flatearthequipment.com/es/brand/mec/fault-codes',
  'https://www.flatearthequipment.com/insights/genie-lift-battery-replacement',
  'https://www.flatearthequipment.com/insights/warehouse-safety-tips',
  'https://www.flatearthequipment.com/brand/nissan/fault-codes',
  'https://www.flatearthequipment.com/es/brand/clark/fault-codes',
  'https://www.flatearthequipment.com/es/brand/nissan/fault-codes',
  'https://www.flatearthequipment.com/insights/fixing-jcb-p-0107-atmospheric-pressure-sensor-faults',
  'https://www.flatearthequipment.com/insights/forklift-center-of-gravity',
  'https://www.flatearthequipment.com/insights/osha-forklift-training-requirements',
];

// IndexNow API endpoints (submit to one, others sync automatically)
// Using Yandex as primary since it accepts immediately
const INDEXNOW_ENDPOINTS = [
  'https://yandex.com/indexnow',
  'https://www.bing.com/indexnow',
];

interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

async function submitToIndexNow(endpoint: string, urls: string[]): Promise<{ success: boolean; status: number; message: string }> {
  const payload: IndexNowPayload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    // IndexNow returns:
    // 200 = OK, URL submitted successfully
    // 202 = Accepted, URL received but may take time to process
    // 400 = Bad request (invalid format)
    // 403 = Forbidden (key not valid for this URL)
    // 422 = Unprocessable Entity (URLs don't belong to host)
    // 429 = Too Many Requests

    const statusMessages: Record<number, string> = {
      200: 'URLs submitted successfully',
      202: 'URLs accepted, pending processing',
      400: 'Bad request - invalid format',
      403: 'Forbidden - key validation failed',
      422: 'Unprocessable - URLs do not belong to host',
      429: 'Rate limited - too many requests',
    };

    return {
      success: response.status === 200 || response.status === 202,
      status: response.status,
      message: statusMessages[response.status] || `Unknown status: ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

async function main() {
  console.log('🚀 IndexNow Bulk URL Submission');
  console.log('================================');
  console.log(`Host: ${HOST}`);
  console.log(`Key: ${INDEXNOW_KEY}`);
  console.log(`Total URLs: ${URLS_TO_SUBMIT.length}`);
  console.log('');

  // IndexNow accepts up to 10,000 URLs per request, but we'll batch in chunks of 100
  const BATCH_SIZE = 100;
  const batches: string[][] = [];
  
  for (let i = 0; i < URLS_TO_SUBMIT.length; i += BATCH_SIZE) {
    batches.push(URLS_TO_SUBMIT.slice(i, i + BATCH_SIZE));
  }

  console.log(`Submitting in ${batches.length} batch(es)...`);
  console.log('');

  let totalSubmitted = 0;
  let totalFailed = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`📦 Batch ${i + 1}/${batches.length} (${batch.length} URLs)`);

    // Submit to first endpoint (others sync automatically via IndexNow network)
    const endpoint = INDEXNOW_ENDPOINTS[0];
    const result = await submitToIndexNow(endpoint, batch);

    if (result.success) {
      console.log(`   ✅ ${result.message} (HTTP ${result.status})`);
      totalSubmitted += batch.length;
    } else {
      console.log(`   ❌ ${result.message} (HTTP ${result.status})`);
      totalFailed += batch.length;
    }

    // Add a small delay between batches to avoid rate limiting
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('');
  console.log('================================');
  console.log('📊 Summary:');
  console.log(`   ✅ Submitted: ${totalSubmitted}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log('');
  console.log('💡 Note: IndexNow notifies Bing, Yandex, Seznam, and Naver.');
  console.log('   Google uses its own crawl scheduling and does not support IndexNow.');
}

main().catch(console.error);
