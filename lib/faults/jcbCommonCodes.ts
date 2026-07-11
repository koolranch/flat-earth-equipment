export type CommonFaultCode = {
  code: string;
  title: string;
  meaning: string;
  firstChecks: string;
  relatedGuideHref?: string;
};

/** Crawlable starter set for /brand/jcb/fault-codes — keep in sync with data/faults/jcb.csv themes. */
export const JCB_COMMON_FAULT_CODES: CommonFaultCode[] = [
  {
    code: 'P0087',
    title: 'Fuel rail pressure too low',
    meaning: 'Hard start, power loss, or limp mode from low fuel rail pressure.',
    firstChecks: 'Replace primary fuel filter; verify lift pump primes; inspect for air leaks.',
    relatedGuideHref: '/insights/jcb-p-0087-fuel-rail-pressure-too-low-scv-valve-diagnosis',
  },
  {
    code: 'P0191',
    title: 'Fuel rail pressure sensor performance',
    meaning: 'Erratic rail pressure readings confuse the ECU.',
    firstChecks: 'Check filter age; test sensor 5V/ground; wiggle-test connector.',
  },
  {
    code: 'P2201',
    title: 'NOx sensor out of range',
    meaning: 'Common trigger for regen loops and DEF warnings.',
    firstChecks: 'Inspect NOx connector/harness; check for exhaust leaks upstream.',
  },
  {
    code: 'P20EE',
    title: 'SCR NOx efficiency low',
    meaning: 'SCR reports poor conversion — often sensor or DEF injector, not the catalyst first.',
    firstChecks: 'Fresh DEF (32.5%); inspect DEF injector crystals; verify NOx sensors.',
  },
  {
    code: 'P1C54',
    title: 'SCR inducement derate',
    meaning: 'Power cut as punishment for an unresolved emissions fault.',
    firstChecks: 'Fix the root SCR/DEF code first; top off clean DEF; complete regen if required.',
  },
  {
    code: 'U029D',
    title: 'Lost NOx sensor communication',
    meaning: 'ECU cannot talk to NOx sensor A.',
    firstChecks: 'Battery voltage; NOx connector pins; power/ground/CAN continuity.',
  },
  {
    code: 'U0073',
    title: 'CAN bus off',
    meaning: 'Module network dropped — often battery/grounds before a “bad ECU.”',
    firstChecks: 'Load-test battery; clean grounds; inspect harness at pivots.',
  },
  {
    code: 'E485',
    title: 'AdBlue / DEF quality',
    meaning: 'DEF quality out of range.',
    firstChecks: 'Confirm 32.5% urea; replace contaminated DEF; check quality sensor.',
  },
  {
    code: 'T135',
    title: 'Transmission oil temperature high',
    meaning: 'Transmission overheating warning.',
    firstChecks: 'Oil level; cooler fins; cool down before continued heavy work.',
  },
  {
    code: 'T072',
    title: 'Output speed sensor no signal',
    meaning: 'Erratic shifting or limp gear from missing speed signal.',
    firstChecks: 'Inspect speed sensor connector; check wiring at articulation points.',
  },
  {
    code: 'T121',
    title: 'Forward high solenoid open',
    meaning: 'Open circuit to a forward clutch solenoid.',
    firstChecks: 'Solenoid resistance; connector; harness chafe points.',
  },
  {
    code: 'ENG OIL',
    title: 'Engine oil pressure low',
    meaning: 'Oil pressure below safe threshold.',
    firstChecks: 'Oil level immediately; leaks; filter; sensor before condemning the pump.',
  },
  {
    code: 'FUEL SYS',
    title: 'Fuel system fault',
    meaning: 'Rough run, power loss, or no-start related to fuel delivery.',
    firstChecks: 'Fuel filter first; lift pump prime sound; tank contamination.',
  },
  {
    code: 'REGEN',
    title: 'Regen required / incomplete',
    meaning: 'Parked or active regen requested or failing.',
    firstChecks: 'Complete parked regen when safe; check DEF; scan related SCR codes.',
  },
  {
    code: 'DERATE',
    title: 'Engine derate active',
    meaning: 'Power limited — usually a symptom of another active fault.',
    firstChecks: 'Read active codes; fix root cause; clear after repair.',
  },
];

export const JCB_CODE_RETRIEVAL_STEPS =
  'Key ON → open the dash Diagnostics / Fault Log menu → note Active vs Stored codes → confirm with OK. For stubborn after-treatment codes, a key-cycle (30–60s off) only clears soft faults after the real repair.';
