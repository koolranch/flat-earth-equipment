import { Metadata } from "next";
import { notFound } from "next/navigation";
import { forkliftStates, ForkliftStateInfo } from "../../../../src/data/forkliftStates";
import Link from "next/link";
import StateHero from "@/components/state/StateHero";
import StickyCTA from "@/components/state/StickyCTA";
import StateProductJsonLd from "@/components/state/StateProductJsonLd";
import { getStateMetrics } from "@/lib/safety/stateMetrics";
import HowItWorksStrip from "@/components/HowItWorksStrip";
import PricingStrip from "@/components/training/PricingStrip";
import CaptureClickIds from "@/components/checkout/CaptureClickIds";
import { generatePageAlternates } from "@/app/seo-defaults";
import SafetyScreenshots from "@/app/safety/components/SafetyScreenshots";
import { getMarketingDict } from "@/i18n";
import { FEDERAL_OSHA_PENALTIES_2025 } from "@/lib/safety/osha-penalties";

// Disable dynamic params to ensure only pre-generated pages are served
export const dynamicParams = false

// Nearby states for internal linking (reduces bounce, improves SEO)
const NEARBY_STATES: Record<string, string[]> = {
  al: ['fl', 'ga', 'ms', 'tn'],
  ak: ['wa', 'hi'],
  az: ['ca', 'co', 'nv', 'nm', 'ut'],
  ar: ['la', 'mo', 'ms', 'ok', 'tn', 'tx'],
  ca: ['az', 'nv', 'or'],
  co: ['az', 'ks', 'ne', 'nm', 'ut', 'wy'],
  ct: ['ma', 'ny', 'ri'],
  de: ['md', 'nj', 'pa'],
  fl: ['al', 'ga'],
  ga: ['al', 'fl', 'nc', 'sc', 'tn'],
  hi: ['ca', 'ak'],
  id: ['mt', 'nv', 'or', 'ut', 'wa', 'wy'],
  il: ['in', 'ia', 'ky', 'mo', 'wi'],
  in: ['il', 'ky', 'mi', 'oh'],
  ia: ['il', 'mn', 'mo', 'ne', 'wi'],
  ks: ['co', 'mo', 'ne', 'ok'],
  ky: ['il', 'in', 'oh', 'tn', 'va', 'wv'],
  la: ['ar', 'ms', 'tx'],
  me: ['ma', 'nh'],
  md: ['de', 'pa', 'va', 'wv'],
  ma: ['ct', 'nh', 'ny', 'ri', 'vt'],
  mi: ['in', 'oh', 'wi'],
  mn: ['ia', 'nd', 'sd', 'wi'],
  ms: ['al', 'ar', 'la', 'tn'],
  mo: ['ar', 'il', 'ia', 'ks', 'ky', 'ne', 'ok', 'tn'],
  mt: ['id', 'nd', 'sd', 'wy'],
  ne: ['co', 'ia', 'ks', 'mo', 'sd', 'wy'],
  nv: ['az', 'ca', 'id', 'or', 'ut'],
  nh: ['ma', 'me', 'vt'],
  nj: ['de', 'ny', 'pa'],
  nm: ['az', 'co', 'ok', 'tx', 'ut'],
  ny: ['ct', 'ma', 'nj', 'pa', 'vt'],
  nc: ['ga', 'sc', 'tn', 'va'],
  nd: ['mn', 'mt', 'sd'],
  oh: ['in', 'ky', 'mi', 'pa', 'wv'],
  ok: ['ar', 'co', 'ks', 'mo', 'nm', 'tx'],
  or: ['ca', 'id', 'nv', 'wa'],
  pa: ['de', 'md', 'nj', 'ny', 'oh', 'wv'],
  ri: ['ct', 'ma'],
  sc: ['ga', 'nc'],
  sd: ['ia', 'mn', 'mt', 'ne', 'nd', 'wy'],
  tn: ['al', 'ar', 'ga', 'ky', 'ms', 'nc', 'va'],
  tx: ['ar', 'la', 'nm', 'ok'],
  ut: ['az', 'co', 'id', 'nv', 'nm', 'wy'],
  vt: ['ma', 'nh', 'ny'],
  va: ['ky', 'md', 'nc', 'tn', 'wv'],
  wa: ['id', 'or'],
  wv: ['ky', 'md', 'oh', 'pa', 'va'],
  wi: ['ia', 'il', 'mi', 'mn'],
  wy: ['co', 'id', 'mt', 'ne', 'sd', 'ut'],
};

type Props = { params: { state: string } };

export async function generateStaticParams() {
  return forkliftStates.map((s: ForkliftStateInfo) => ({ state: s.code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const state = forkliftStates.find((s: ForkliftStateInfo) => s.code === params.state) ?? notFound();
  const metrics = getStateMetrics(params.state);

  // Lean titles into high-intent organic variants for signal states (URL unchanged)
  type MetaOverride = {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    twitterTitle: string;
    twitterDescription: string;
  };
  const metaOverrides: Record<string, MetaOverride> = {
    ca: {
      title: 'OSHA Compliant Forklift Certification in California | Cal/OSHA Online',
      description:
        'Get OSHA-compliant forklift certification online in California. Meets federal OSHA and Cal/OSHA training requirements. Theory in under 30 minutes for $49, then employer practical evaluation.',
      ogTitle: 'OSHA Compliant Forklift Certification in California | Cal/OSHA',
      ogDescription:
        'Online OSHA-compliant forklift training for California operators. Cal/OSHA-aligned theory for $49, then workplace practical evaluation.',
      twitterTitle: 'OSHA Compliant Forklift Certification in California',
      twitterDescription:
        'Cal/OSHA-aligned online forklift training for California. $49 theory + employer practical evaluation.',
    },
    tx: {
      title: 'How to Get Forklift Certified in Texas | Online OSHA Training $49',
      description:
        'How to get forklift certified in Texas online: OSHA-compliant theory for $49 (Houston, Dallas–Fort Worth, and statewide), then employer practical evaluation. Instant certificate download.',
      ogTitle: 'How to Get Forklift Certified in Texas | Online OSHA Training',
      ogDescription:
        'Online OSHA-compliant forklift training for Texas operators in Houston, DFW, and statewide. $49 theory + employer practical evaluation.',
      twitterTitle: 'How to Get Forklift Certified in Texas',
      twitterDescription:
        'Texas online forklift certification for Houston, Dallas, and statewide. $49 OSHA-compliant theory.',
    },
    nj: {
      title: 'How to Get Forklift Certification in NJ | Online OSHA Training $49',
      description:
        'How to get forklift certification in New Jersey online. OSHA-compliant theory for $49 (Newark, Jersey City, and statewide), then employer practical evaluation.',
      ogTitle: 'How to Get Forklift Certification in NJ | Online OSHA Training',
      ogDescription:
        'Online OSHA-compliant forklift training for New Jersey operators. $49 theory + workplace practical evaluation.',
      twitterTitle: 'How to Get Forklift Certification in NJ',
      twitterDescription:
        'New Jersey online forklift certification for Newark and statewide. $49 OSHA-compliant theory.',
    },
    wi: {
      title: 'Forklift Training in Milwaukee & Wisconsin | Online OSHA $49',
      description:
        'Online forklift training for Milwaukee and Wisconsin. OSHA-compliant theory for $49, then employer practical evaluation. Instant certificate download.',
      ogTitle: 'Forklift Training in Milwaukee & Wisconsin | Online OSHA',
      ogDescription:
        'Milwaukee and statewide Wisconsin online forklift training. $49 OSHA-compliant theory + workplace practical evaluation.',
      twitterTitle: 'Forklift Training in Milwaukee & Wisconsin',
      twitterDescription:
        'Wisconsin online forklift training for Milwaukee and statewide. $49 OSHA-compliant theory.',
    },
    tn: {
      title: 'Forklift License in Memphis & Tennessee | Online OSHA $49',
      description:
        'Get a forklift license / certification online in Memphis and Tennessee. OSHA-compliant theory for $49, then employer practical evaluation.',
      ogTitle: 'Forklift License in Memphis & Tennessee | Online OSHA',
      ogDescription:
        'Memphis and statewide Tennessee online forklift certification. $49 OSHA-compliant theory + workplace practical evaluation.',
      twitterTitle: 'Forklift License in Memphis & Tennessee',
      twitterDescription:
        'Tennessee online forklift license training for Memphis and statewide. $49 OSHA-compliant theory.',
    },
    il: {
      title: 'Forklift Certification in Chicago & Illinois | Online OSHA $49',
      description:
        'Online forklift certification for Chicago and Illinois. OSHA-compliant theory for $49, then employer practical evaluation. Instant certificate download.',
      ogTitle: 'Forklift Certification in Chicago & Illinois | Online OSHA',
      ogDescription:
        'Chicago and statewide Illinois online forklift training. $49 OSHA-compliant theory + workplace practical evaluation.',
      twitterTitle: 'Forklift Certification in Chicago & Illinois',
      twitterDescription:
        'Illinois online forklift certification for Chicago and statewide. $49 OSHA-compliant theory.',
    },
    fl: {
      title: 'Forklift Certification in Miami & Florida | Online OSHA $49',
      description:
        'Online forklift certification for Miami, Jacksonville, Tampa, and Florida. OSHA-compliant theory for $49, then employer practical evaluation.',
      ogTitle: 'Forklift Certification in Miami & Florida | Online OSHA',
      ogDescription:
        'Miami and statewide Florida online forklift training. $49 OSHA-compliant theory + workplace practical evaluation.',
      twitterTitle: 'Forklift Certification in Miami & Florida',
      twitterDescription:
        'Florida online forklift certification for Miami, Tampa, and Jacksonville. $49 OSHA-compliant theory.',
    },
    az: {
      title: 'Forklift Certification in Phoenix & Arizona | Online OSHA $49',
      description:
        'Online forklift certification for Phoenix, Tucson, and Arizona. OSHA-compliant theory for $49, then employer practical evaluation—faster than local classroom seats.',
      ogTitle: 'Forklift Certification in Phoenix & Arizona | Online OSHA',
      ogDescription:
        'Phoenix and statewide Arizona online forklift training. $49 OSHA-compliant theory + workplace practical evaluation.',
      twitterTitle: 'Forklift Certification in Phoenix & Arizona',
      twitterDescription:
        'Arizona online forklift certification for Phoenix and Tucson. $49 OSHA-compliant theory.',
    },
    ny: {
      title: 'Forklift Certification in NYC & New York | Online OSHA $49',
      description:
        'Online forklift certification for New York City, Buffalo, Rochester, and statewide. OSHA-compliant theory for $49, then employer practical evaluation.',
      ogTitle: 'Forklift Certification in NYC & New York | Online OSHA',
      ogDescription:
        'NYC and statewide New York online forklift training. $49 OSHA-compliant theory + workplace practical evaluation.',
      twitterTitle: 'Forklift Certification in NYC & New York',
      twitterDescription:
        'New York online forklift certification for NYC, Buffalo, and Rochester. $49 OSHA-compliant theory.',
    },
  };
  const override = metaOverrides[params.state];
  
  return {
    title: override?.title ?? `How to Get Forklift Certified in ${state.name} | Online OSHA Training`,
    description:
      override?.description ??
      `Learn how to get forklift certified in ${state.name}. Complete OSHA-compliant certification online in under 30 minutes. Instant certificate download for ${state.name} operators.`,
    alternates: generatePageAlternates(`/safety/forklift/${state.code}`),
    robots: {
      index: metrics.shouldIndex,
      follow: true,
      googleBot: {
        index: metrics.shouldIndex,
        follow: true,
      }
    },
    openGraph: {
      title: override?.ogTitle ?? `Forklift Certification in ${state.name} | OSHA Compliant`,
      description:
        override?.ogDescription ??
        `Get certified in under 30 minutes. OSHA-compliant online training for ${state.name} operators. Instant certificate download.`,
      url: `https://www.flatearthequipment.com/safety/forklift/${state.code}`,
      siteName: 'Flat Earth Equipment',
      images: [
        {
          url: 'https://www.flatearthequipment.com/og-safety-training.png',
          width: 1200,
          height: 630,
          alt: `Forklift Certification Training in ${state.name}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: override?.twitterTitle ?? `Forklift Certification in ${state.name}`,
      description:
        override?.twitterDescription ??
        `Get OSHA-compliant forklift certification online in under 30 minutes. Valid in ${state.name}.`,
      images: ['https://www.flatearthequipment.com/og-safety-training.png'],
    },
  };
}

// Breadcrumb component
function Breadcrumb({ stateName }: { stateName: string }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link href="/" className="hover:text-safety transition-colors">
        Home
      </Link>
      <span>/</span>
      <Link href="/safety" className="hover:text-safety transition-colors">
        Safety Training
      </Link>
      <span>/</span>
      <Link href="/safety/forklift" className="hover:text-safety transition-colors">
        Forklift Certification
      </Link>
      <span>/</span>
      <span className="text-gray-900">{stateName}</span>
    </nav>
  )
}

export default function StateForkliftPage({ params }: Props) {
  const info = forkliftStates.find((s: ForkliftStateInfo) => s.code === params.state) ?? notFound();
  const metrics = getStateMetrics(params.state);
  const t = getMarketingDict('en');
  const nearbyStates = (NEARBY_STATES[info.code] || [])
    .map(code => forkliftStates.find(s => s.code === code))
    .filter(Boolean) as ForkliftStateInfo[];

  return (
    <>
      <CaptureClickIds />
      {/* Enhanced SEO Product JSON-LD */}
      <StateProductJsonLd stateCode={info.code} />
      
      {/* New State-Aware Hero Section */}
      <StateHero metrics={metrics} />
      
      <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
        <Breadcrumb stateName={info.name} />
        
        {/* SOCIAL PROOF STRIP - State-specific metrics */}
        <section className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap justify-around items-center gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-orange-600">{metrics.operatorsCertified.toLocaleString()}+</div>
            <div className="text-sm text-gray-600 mt-1">Certified Operators</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600">30</div>
            <div className="text-sm text-gray-600 mt-1">Minutes to Complete</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-gray-600 mt-1">OSHA Compliant</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-600">3 Years</div>
            <div className="text-sm text-gray-600 mt-1">Certification Valid</div>
          </div>
        </div>
        
        {/* Metro jump links for Texas */}
        {info.code === 'tx' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Jump to{' '}
            <a href="#houston" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Houston
            </a>
            {' · '}
            <a href="#dfw" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Dallas–Fort Worth
            </a>
            {' · '}
            <a href="#texas-online" className="text-orange-600 hover:text-orange-700 underline font-medium">
              how to get certified online in Texas
            </a>
            .
          </p>
        )}
        {info.code === 'ca' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Jump to{' '}
            <a href="#california-osha" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Cal/OSHA &amp; OSHA-compliant training
            </a>
            {' · '}
            <a href="#los-angeles" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Los Angeles
            </a>
            {' · '}
            <a href="#san-diego" className="text-orange-600 hover:text-orange-700 underline font-medium">
              San Diego
            </a>
            {' · '}
            <a href="#sacramento" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Sacramento
            </a>
            .
          </p>
        )}
        {info.code === 'nj' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Jump to{' '}
            <a href="#nj-how-to" className="text-orange-600 hover:text-orange-700 underline font-medium">
              how to get forklift certification in NJ
            </a>
            {' · '}
            <a href="#newark" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Newark
            </a>
            .
          </p>
        )}
        {info.code === 'wi' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Jump to{' '}
            <a href="#milwaukee" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Milwaukee forklift training
            </a>
            {' · '}
            <a href="#wisconsin-online" className="text-orange-600 hover:text-orange-700 underline font-medium">
              statewide Wisconsin certification
            </a>
            .
          </p>
        )}
        {info.code === 'tn' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Jump to{' '}
            <a href="#memphis" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Memphis forklift license
            </a>
            {' · '}
            <a href="#nashville" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Nashville
            </a>
            .
          </p>
        )}
        {info.code === 'il' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Jump to{' '}
            <a href="#chicago" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Chicago forklift certification
            </a>
            {' · '}
            <a href="#illinois-online" className="text-orange-600 hover:text-orange-700 underline font-medium">
              statewide Illinois
            </a>
            .
          </p>
        )}
        {info.code === 'fl' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Jump to{' '}
            <a href="#miami" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Miami
            </a>
            {' · '}
            <a href="#jacksonville" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Jacksonville
            </a>
            {' · '}
            <a href="#tampa" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Tampa
            </a>
            .
          </p>
        )}
        {info.code === 'az' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Jump to{' '}
            <a href="#phoenix" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Phoenix forklift certification
            </a>
            {' · '}
            <a href="#tucson" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Tucson
            </a>
            .
          </p>
        )}
        {info.code === 'ny' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Jump to{' '}
            <a href="#nyc" className="text-orange-600 hover:text-orange-700 underline font-medium">
              New York City
            </a>
            {' · '}
            <a href="#buffalo" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Buffalo
            </a>
            {' · '}
            <a href="#rochester" className="text-orange-600 hover:text-orange-700 underline font-medium">
              Rochester
            </a>
            .
          </p>
        )}
      </section>

      <SafetyScreenshots t={t} locale="en" compact />

      {/* FINES TABLE - Pain point to motivate action */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">OSHA Penalties in {info.name}</h2>
        <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <th className="py-4 px-6 font-semibold">Violation Type</th>
                <th className="py-4 px-6 font-semibold">Possible Fine</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-orange-100">
                <td className="py-4 px-6 text-gray-900">Serious / Other-Than-Serious</td>
                <td className="py-4 px-6 font-semibold text-orange-600">
                  ${info.fines.min.toLocaleString()} – ${info.fines.seriousMax.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-orange-50">
                <td className="py-4 px-6 text-gray-900">Willful / Repeat</td>
                <td className="py-4 px-6 font-semibold text-red-600">Up to ${info.fines.willfulMax.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
          {info.hasStatePlan
            ? `💡 ${info.name} operates its own OSHA-approved State Plan; fines may differ from federal maximums.`
            : `💡 ${info.name} is regulated directly by Federal OSHA.`}{' '}
          Federal maximums shown reflect OSHA&apos;s {FEDERAL_OSHA_PENALTIES_2025.effectiveDate} inflation adjustment.
        </p>
      </section>

      {/* Pricing - immediately after fines for maximum conversion */}
      <PricingStrip />

      {/* Comparison Table - Classroom vs Online */}
      <section className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-6">
          Why {info.name} Operators Choose Online Training
        </h2>
        
        {/* Mobile: Stacked comparison cards */}
        <div className="space-y-4 sm:hidden">
          {[
            { icon: '⏰', label: 'Time', old: '8 hours', new: 'Under 30 min' },
            { icon: '💵', label: 'Cost', old: '$200-$500', new: '$49' },
            { icon: '📍', label: 'Location', old: 'Travel required', new: 'Anywhere' },
            { icon: '📜', label: 'Certificate', old: '1-2 weeks', new: 'Instant' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-semibold text-slate-500">{item.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Classroom</div>
                  <div className="font-medium text-slate-700">{item.old}</div>
                </div>
                <div className="border-l-2 border-[#F76511] pl-3">
                  <div className="text-xs text-[#F76511] font-semibold mb-1">Online</div>
                  <div className="font-bold text-[#F76511]">{item.new}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-blue-300">
                <th className="pb-3 text-slate-700 font-semibold"></th>
                <th className="pb-3 text-slate-700 font-semibold">Traditional Classroom</th>
                <th className="pb-3 text-[#F76511] font-bold">Flat Earth Safety Online</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-blue-100">
                <td className="py-3 font-medium text-slate-700">⏰ Time Required</td>
                <td className="py-3 text-slate-600">8 hours (full day)</td>
                <td className="py-3 text-[#F76511] font-semibold">Under 30 minutes</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-3 font-medium text-slate-700">💵 Cost</td>
                <td className="py-3 text-slate-600">$200-$500</td>
                <td className="py-3 text-[#F76511] font-semibold">$49</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-3 font-medium text-slate-700">📍 Location</td>
                <td className="py-3 text-slate-600">Must travel to center</td>
                <td className="py-3 text-[#F76511] font-semibold">Train anywhere in {info.name}</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-3 font-medium text-slate-700">📅 Schedule</td>
                <td className="py-3 text-slate-600">Fixed class times</td>
                <td className="py-3 text-[#F76511] font-semibold">24/7 - Start now</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-3 font-medium text-slate-700">📜 Certificate</td>
                <td className="py-3 text-slate-600">Mail in 1-2 weeks</td>
                <td className="py-3 text-[#F76511] font-semibold">Instant download</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-3 font-medium text-slate-700">✅ OSHA Compliance</td>
                <td className="py-3 text-slate-600">29 CFR 1910.178</td>
                <td className="py-3 text-[#F76511] font-semibold">29 CFR 1910.178</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-700">🔄 Retakes</td>
                <td className="py-3 text-slate-600">Pay again</td>
                <td className="py-3 text-[#F76511] font-semibold">Free unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 text-center p-4 bg-white rounded-xl border border-blue-200">
          <p className="text-base sm:text-lg font-bold text-slate-900">
            💰 You save: $151-$451 + 7 hours
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Same OSHA certification. Faster and more convenient.
          </p>
        </div>
      </section>

        {/* HOW TO GET CERTIFIED SECTION */}
        <section className="space-y-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">How to Get Forklift Certified in {info.name}</h2>
            <p className="text-lg text-gray-600">
              Follow our simple process to get your official {info.name} certification today.
            </p>
          </div>
          <HowItWorksStrip />
        </section>

      {/* Testimonial band — routes to pricing instead of a duplicate checkout CTA */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center text-white md:p-10 space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-400">Trusted in {info.name}</p>
        <h2 className="text-3xl font-bold md:text-4xl">Ready to Get Certified in {info.name}?</h2>
        
        <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          {metrics.testimonial ? (
            <>
              <p className="mb-3 text-lg italic text-slate-200">
                &ldquo;{metrics.testimonial.quote}&rdquo;
              </p>
              <p className="text-sm font-semibold text-orange-300">
                — {metrics.testimonial.name}, {metrics.testimonial.title} in {metrics.testimonial.city}
              </p>
            </>
          ) : (
            <>
              <p className="mb-3 text-lg italic text-slate-200">
                &ldquo;Quick, easy, and affordable. Finished my certification during lunch break. The mobile version worked great on my phone!&rdquo;
              </p>
              <p className="text-sm font-semibold text-orange-300">
                — Certified Operator in {info.name}
              </p>
            </>
          )}
        </div>
        
        <div className="pt-2">
          <Link
            href="#pricing"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            View plans &amp; pricing — from $49
          </Link>
          <p className="mt-4 text-sm text-slate-400">
            Free app to study all 5 modules · Pay $49 only at the final exam · Instant download · Free retakes
          </p>
          <Link href="/safety" className="mt-3 inline-block text-sm text-orange-300 underline hover:text-orange-200">
            Compare all training options →
          </Link>
        </div>
      </section>

      {/* ───────────────── TEXAS METRO + ONLINE PATH (TX Only) ───────────────── */}
      {info.code === 'tx' && (
        <section className="mt-12 space-y-10">
          <div
            id="texas-online"
            className="scroll-mt-24 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                How to Get Forklift Certified in Texas Online
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                Local Texas schools and nonprofits often sell multi-hour classroom seats. If you need
                OSHA-compliant theory fast—especially for Houston or Dallas–Fort Worth hiring—complete
                online instruction for <strong>$49</strong> (about 30 minutes), download your certificate,
                then have your supervisor finish the required hands-on evaluation on your equipment.
              </p>
              <ol className="mt-4 list-decimal pl-5 text-gray-700 space-y-2">
                <li>Enroll and finish the online OSHA theory modules.</li>
                <li>Pass the exam and download your certificate.</li>
                <li>
                  Complete the employer practical using our{' '}
                  <a
                    href="/docs/forklift-employer-eval.pdf"
                    className="underline hover:text-orange-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    evaluation checklist (PDF)
                  </a>
                  .
                </li>
              </ol>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <Link
                  href="/insights/how-to-get-a-forklift-license"
                  className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-white transition-colors"
                >
                  Full license requirements guide
                </Link>
              </div>
            </div>
          </div>

          <div
            id="houston"
            className="scroll-mt-24 bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Forklift Certification in Houston
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                Serving Houston, Pasadena, Baytown, Sugar Land, The Woodlands, and the Ship Channel /
                petrochemical corridor. Skip the drive to a local classroom for theory—train online,
                then evaluate on the truck you actually use at the warehouse, terminal, or plant.
              </p>
              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>
                  <span className="font-medium">Coverage:</span> Greater Houston logistics, energy,
                  manufacturing, and port-adjacent sites.
                </li>
                <li>
                  <span className="font-medium">Format:</span> Online OSHA-compliant theory + employer
                  practical on your site.
                </li>
                <li>
                  <span className="font-medium">vs local schools:</span> Same federal OSHA standard;
                  online theory is usually faster and lower cost for multi-shift crews.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <a
                  href="/docs/forklift-employer-eval.pdf"
                  className="inline-flex min-h-[44px] items-center underline font-medium text-gray-800 hover:text-orange-600 px-3 py-3 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer Checklist (PDF)
                </a>
              </div>
            </div>
          </div>

          <div
            id="dfw"
            className="scroll-mt-24 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Dallas–Fort Worth (DFW) Forklift Certification
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                Serving Dallas, Fort Worth, Arlington, Irving, Grand Prairie, Mesquite, and Garland.
                Complete the online theory in about 30 minutes (English &amp; Spanish), then your supervisor
                performs the onsite practical using our evaluation checklist. Same-day wallet card; renewal every 3 years.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <Link
                  href="/training#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-gray-400 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  Crew Packs for Employers
                </Link>
                <a
                  href="/docs/forklift-employer-eval.pdf"
                  className="inline-flex min-h-[44px] items-center underline font-medium text-gray-800 hover:text-orange-600 px-3 py-3 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer Checklist (PDF)
                </a>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-900">DFW Coverage &amp; FAQs</h3>
                <ul className="mt-3 list-disc pl-5 text-gray-700 space-y-2">
                  <li>
                    <span className="font-medium">Coverage:</span> Dallas, Fort Worth, Arlington,
                    Irving, Grand Prairie, Mesquite, Garland.
                  </li>
                  <li>
                    <span className="font-medium">Format:</span> Online theory + employer practical on
                    your equipment/site.
                  </li>
                  <li>
                    <span className="font-medium">Bilingual:</span> English &amp; Spanish available.
                  </li>
                  <li>
                    <span className="font-medium">Compliance:</span> Meets OSHA 29 CFR 1910.178(l);
                    renew every 3 years or after incidents/equipment changes.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* ──────────────── END TEXAS METRO SECTION ──────────────── */}

      {/* ───────────────── CALIFORNIA METRO + CAL/OSHA (CA Only) ───────────────── */}
      {info.code === 'ca' && (
        <section id="california-osha" className="scroll-mt-24 mt-12 space-y-10">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-8 shadow-sm">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                OSHA Compliant Forklift Certification in California
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                Looking for &ldquo;OSHA approved&rdquo; or OSHA-compliant forklift certification in California?
                OSHA does not endorse private training brands—employers need training that meets{' '}
                <strong>29 CFR 1910.178(l)</strong>. California also enforces powered industrial truck
                rules through <strong>Cal/OSHA</strong> (a state plan that meets or exceeds federal OSHA).
              </p>
              <p className="mt-3 text-gray-700">
                Our online course covers the formal instruction portion for <strong>$49</strong> (about
                30 minutes). Your supervisor or qualified evaluator then completes the required
                hands-on practical on your site and equipment. Same theory path statewide—from Los
                Angeles warehouses to Central Valley ag sites.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <a
                  href="/docs/forklift-employer-eval.pdf"
                  className="inline-flex min-h-[44px] items-center underline font-medium text-gray-800 hover:text-orange-600 px-3 py-3 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer Checklist (PDF)
                </a>
                <Link
                  href="/insights/how-to-get-a-forklift-license"
                  className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-white transition-colors"
                >
                  License requirements guide
                </Link>
              </div>
              <ul className="mt-6 list-disc pl-5 text-gray-700 space-y-2">
                <li>
                  <span className="font-medium">Federal OSHA:</span> Formal instruction + workplace
                  practical evaluation under 29 CFR 1910.178(l).
                </li>
                <li>
                  <span className="font-medium">Cal/OSHA:</span> California state-plan enforcement;
                  employers still document theory training and site-specific evaluation.
                </li>
                <li>
                  <span className="font-medium">Renewal:</span> At least every 3 years, or sooner
                  after an incident, near-miss, or equipment change.
                </li>
              </ul>
            </div>
          </div>

          <div id="los-angeles" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Los Angeles
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Serving Los Angeles, Long Beach, Vernon, Commerce, Carson, and the LA/Long Beach port
              corridor. Finish online theory on your phone, then complete the employer practical at
              your warehouse, yard, or dock—no need to travel to a classroom for the classroom
              portion.
            </p>
            <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
              <li>
                <span className="font-medium">Coverage:</span> LA Basin distribution, ports, and
                manufacturing sites.
              </li>
              <li>
                <span className="font-medium">Format:</span> Online OSHA-compliant theory + onsite
                practical on your equipment.
              </li>
              <li>
                <span className="font-medium">Teams:</span> Multi-operator crews can study on their
                own schedule, then share one employer evaluation workflow.
              </li>
            </ul>
          </div>

          <div id="san-diego" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in San Diego
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              For San Diego, Chula Vista, Oceanside, and nearby logistics and manufacturing
              employers. Online theory works for day and night shifts; your qualified evaluator
              signs off the practical where you actually operate.
            </p>
            <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
              <li>
                <span className="font-medium">Coverage:</span> San Diego County warehouses, ports,
                and industrial parks.
              </li>
              <li>
                <span className="font-medium">Compliance:</span> Same federal OSHA + Cal/OSHA path
                as the rest of California.
              </li>
            </ul>
          </div>

          <div id="sacramento" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Sacramento
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Serving Sacramento, West Sacramento, Elk Grove, Roseville, and Central Valley
              distribution. Get the theory done online for $49, then document the workplace
              practical with our employer checklist.
            </p>
            <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
              <li>
                <span className="font-medium">Coverage:</span> Greater Sacramento and nearby
                warehouse / food / logistics employers.
              </li>
              <li>
                <span className="font-medium">Also nearby:</span> Fresno, Stockton, and Bakersfield
                operators use the same California certification path.
              </li>
            </ul>
          </div>
        </section>
      )}
      {/* ──────────────── END CALIFORNIA METRO SECTION ──────────────── */}

      {/* ───────────────── NEW JERSEY (NJ Only) ───────────────── */}
      {info.code === 'nj' && (
        <section className="mt-12 space-y-10">
          <div
            id="nj-how-to"
            className="scroll-mt-24 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                How to Get Forklift Certification in NJ
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                New Jersey search results often surface .gov workforce pages and local driving schools.
                If you need OSHA-compliant theory fast, complete online instruction for{' '}
                <strong>$49</strong> (about 30 minutes), download your certificate, then have a
                qualified person at your NJ workplace finish the required hands-on evaluation.
              </p>
              <ol className="mt-4 list-decimal pl-5 text-gray-700 space-y-2">
                <li>Enroll and finish the online OSHA theory modules.</li>
                <li>Pass the exam and download your certificate.</li>
                <li>
                  Complete the employer practical using our{' '}
                  <a
                    href="/docs/forklift-employer-eval.pdf"
                    className="underline hover:text-orange-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    evaluation checklist (PDF)
                  </a>
                  .
                </li>
              </ol>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <Link
                  href="/insights/how-to-get-a-forklift-license"
                  className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-white transition-colors"
                >
                  License requirements guide
                </Link>
              </div>
            </div>
          </div>

          <div id="newark" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Newark, NJ
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Serving Newark, Elizabeth, Jersey City, and the Port of NY/NJ corridor. Train online for
              the classroom portion, then evaluate on the truck you use at the warehouse, terminal, or
              plant—no need to sit a multi-hour local class for theory.
            </p>
            <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
              <li>
                <span className="font-medium">Coverage:</span> Newark / Elizabeth logistics, port
                adjacent sites, and North Jersey warehouses.
              </li>
              <li>
                <span className="font-medium">Format:</span> Online OSHA-compliant theory + employer
                practical on your equipment.
              </li>
              <li>
                <span className="font-medium">Also nearby:</span> Paterson, Edison, Woodbridge, and
                Camden operators use the same New Jersey certification path.
              </li>
            </ul>
          </div>
        </section>
      )}
      {/* ──────────────── END NEW JERSEY SECTION ──────────────── */}

      {/* ───────────────── WISCONSIN (WI Only) ───────────────── */}
      {info.code === 'wi' && (
        <section className="mt-12 space-y-10">
          <div
            id="milwaukee"
            className="scroll-mt-24 bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Forklift Training in Milwaukee
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                Milwaukee SERPs often feature community programs and state workforce pages. For
                online forklift training that covers OSHA formal instruction, finish theory for{' '}
                <strong>$49</strong>, then complete the practical evaluation with your supervisor on
                site.
              </p>
              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>
                  <span className="font-medium">Coverage:</span> Milwaukee, West Allis, Waukesha, and
                  nearby manufacturing / warehouse employers.
                </li>
                <li>
                  <span className="font-medium">Format:</span> Online OSHA-compliant theory + employer
                  practical on your equipment.
                </li>
                <li>
                  <span className="font-medium">vs local programs:</span> Same federal OSHA standard;
                  online theory fits night-shift and multi-site crews.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <a
                  href="/docs/forklift-employer-eval.pdf"
                  className="inline-flex min-h-[44px] items-center underline font-medium text-gray-800 hover:text-orange-600 px-3 py-3 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer Checklist (PDF)
                </a>
              </div>
            </div>
          </div>

          <div
            id="wisconsin-online"
            className="scroll-mt-24 max-w-3xl"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Wisconsin
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Operators across Madison, Green Bay, Appleton, and the rest of Wisconsin use the same
              path: online OSHA theory, then workplace practical evaluation. Renew at least every 3
              years, or sooner after an incident or equipment change.
            </p>
            <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
              <li>
                <span className="font-medium">Statewide:</span> One online course works for every
                Wisconsin worksite that follows federal OSHA PIT rules.
              </li>
              <li>
                <span className="font-medium">Also nearby:</span> Madison and Green Bay crews can
                study on their own schedule, then share one employer evaluation workflow.
              </li>
            </ul>
          </div>
        </section>
      )}
      {/* ──────────────── END WISCONSIN SECTION ──────────────── */}

      {/* ───────────────── TENNESSEE (TN Only) ───────────────── */}
      {info.code === 'tn' && (
        <section className="mt-12 space-y-10">
          <div
            id="memphis"
            className="scroll-mt-24 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Forklift License in Memphis, TN
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                Searching for a forklift license in Memphis? Employers mean OSHA forklift operator
                certification—not a DMV card. Complete online theory for <strong>$49</strong>, then
                finish the hands-on evaluation at your Memphis warehouse, hub, or plant.
              </p>
              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>
                  <span className="font-medium">Coverage:</span> Memphis logistics, distribution, and
                  industrial sites across Shelby County.
                </li>
                <li>
                  <span className="font-medium">Format:</span> Online OSHA-compliant theory + employer
                  practical on your equipment.
                </li>
                <li>
                  <span className="font-medium">vs local classes:</span> Same OSHA framework; online
                  theory is usually faster for multi-shift crews.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <a
                  href="/docs/forklift-employer-eval.pdf"
                  className="inline-flex min-h-[44px] items-center underline font-medium text-gray-800 hover:text-orange-600 px-3 py-3 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer Checklist (PDF)
                </a>
              </div>
            </div>
          </div>

          <div id="nashville" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Nashville
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Serving Nashville, Murfreesboro, Franklin, and Middle Tennessee distribution and
              manufacturing. Same statewide path as Memphis: online theory, then workplace practical.
            </p>
            <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
              <li>
                <span className="font-medium">Coverage:</span> Greater Nashville warehouses,
                automotive suppliers, and logistics employers.
              </li>
              <li>
                <span className="font-medium">Also:</span> Knoxville and Chattanooga operators use
                the same Tennessee certification course.
              </li>
            </ul>
          </div>
        </section>
      )}
      {/* ──────────────── END TENNESSEE METRO SECTION ──────────────── */}

      {/* ───────────────── ILLINOIS (IL Only) ───────────────── */}
      {info.code === 'il' && (
        <section className="mt-12 space-y-10">
          <div
            id="chicago"
            className="scroll-mt-24 bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Forklift Certification in Chicago
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                Chicago SERPs often feature community colleges, staffing firms, and local trainers. For
                OSHA-compliant theory online at <strong>$49</strong>, finish instruction on your phone,
                then complete the practical evaluation with your supervisor at the warehouse or plant.
              </p>
              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>
                  <span className="font-medium">Coverage:</span> Chicago, Cicero, Joliet, Aurora, and
                  Chicagoland distribution corridors.
                </li>
                <li>
                  <span className="font-medium">Format:</span> Online OSHA-compliant theory + employer
                  practical on your equipment.
                </li>
                <li>
                  <span className="font-medium">vs classroom:</span> Same federal OSHA standard; online
                  theory fits multi-shift logistics crews.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <a
                  href="/docs/forklift-employer-eval.pdf"
                  className="inline-flex min-h-[44px] items-center underline font-medium text-gray-800 hover:text-orange-600 px-3 py-3 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer Checklist (PDF)
                </a>
              </div>
            </div>
          </div>

          <div id="illinois-online" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Illinois
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Operators across Rockford, Peoria, Springfield, and the rest of Illinois use the same
              path: online OSHA theory, then workplace practical evaluation. Renew at least every 3
              years.
            </p>
          </div>
        </section>
      )}
      {/* ──────────────── END ILLINOIS SECTION ──────────────── */}

      {/* ───────────────── FLORIDA (FL Only) ───────────────── */}
      {info.code === 'fl' && (
        <section className="mt-12 space-y-10">
          <div
            id="miami"
            className="scroll-mt-24 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Forklift Certification in Miami
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                Serving Miami, Hialeah, Fort Lauderdale, and South Florida logistics. Finish online
                theory for <strong>$49</strong>, then evaluate on the truck you use at the warehouse,
                cold storage, or port-adjacent site.
              </p>
              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>
                  <span className="font-medium">Coverage:</span> Miami-Dade / Broward distribution and
                  import-export warehouses.
                </li>
                <li>
                  <span className="font-medium">Format:</span> Online OSHA-compliant theory + employer
                  practical on your equipment.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <a
                  href="/docs/forklift-employer-eval.pdf"
                  className="inline-flex min-h-[44px] items-center underline font-medium text-gray-800 hover:text-orange-600 px-3 py-3 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer Checklist (PDF)
                </a>
              </div>
            </div>
          </div>

          <div id="jacksonville" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Jacksonville
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              For Jacksonville port, rail, and warehouse employers: complete online theory, then
              document the workplace practical with our employer checklist. Same Florida-wide OSHA path.
            </p>
          </div>

          <div id="tampa" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Tampa
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Serving Tampa, St. Petersburg, and Clearwater distribution. Online theory fits day and
              night shifts; your qualified evaluator signs off where you actually operate.
            </p>
          </div>
        </section>
      )}
      {/* ──────────────── END FLORIDA SECTION ──────────────── */}

      {/* ───────────────── ARIZONA (AZ Only) ───────────────── */}
      {info.code === 'az' && (
        <section className="mt-12 space-y-10">
          <div
            id="phoenix"
            className="scroll-mt-24 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Forklift Certification in Phoenix
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                Local Phoenix trainers often sell in-person seats. If you need OSHA-compliant theory
                fast for <strong>$49</strong>, train online, then complete the practical evaluation at
                your Mesa, Chandler, Glendale, or Phoenix warehouse.
              </p>
              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>
                  <span className="font-medium">Coverage:</span> Phoenix metro distribution,
                  manufacturing, and e-commerce fulfillment.
                </li>
                <li>
                  <span className="font-medium">Format:</span> Online OSHA-compliant theory + employer
                  practical on your equipment.
                </li>
                <li>
                  <span className="font-medium">vs in-person:</span> Same federal OSHA standard; online
                  theory is usually faster for multi-site crews.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <a
                  href="/docs/forklift-employer-eval.pdf"
                  className="inline-flex min-h-[44px] items-center underline font-medium text-gray-800 hover:text-orange-600 px-3 py-3 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer Checklist (PDF)
                </a>
              </div>
            </div>
          </div>

          <div id="tucson" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Tucson
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Tucson manufacturers and warehouses use the same Arizona path: online OSHA theory, then
              workplace practical evaluation. No separate state license beyond OSHA compliance.
            </p>
          </div>
        </section>
      )}
      {/* ──────────────── END ARIZONA SECTION ──────────────── */}

      {/* ───────────────── NEW YORK (NY Only) ───────────────── */}
      {info.code === 'ny' && (
        <section className="mt-12 space-y-10">
          <div
            id="nyc"
            className="scroll-mt-24 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Forklift Certification in New York City
              </h2>
              <p className="mt-3 text-gray-700 text-lg">
                For NYC warehouses, last-mile hubs, and borough logistics: finish online OSHA theory
                for <strong>$49</strong>, then have a qualified evaluator complete the practical on
                your equipment. Employer-accepted online theory + on-site eval—not a DMV license.
              </p>
              <ul className="mt-4 list-disc pl-5 text-gray-700 space-y-2">
                <li>
                  <span className="font-medium">Coverage:</span> NYC metro warehouses, ports-adjacent
                  sites, and corporate logistics.
                </li>
                <li>
                  <span className="font-medium">Format:</span> Online OSHA-compliant theory + employer
                  practical on your equipment.
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg"
                >
                  View Pricing — $49
                </Link>
                <a
                  href="/docs/forklift-employer-eval.pdf"
                  className="inline-flex min-h-[44px] items-center underline font-medium text-gray-800 hover:text-orange-600 px-3 py-3 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer Checklist (PDF)
                </a>
              </div>
            </div>
          </div>

          <div id="buffalo" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Buffalo
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Western New York manufacturers and distribution centers use the same statewide path:
              online theory, then workplace practical evaluation.
            </p>
          </div>

          <div id="rochester" className="scroll-mt-24 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Forklift Certification in Rochester
            </h2>
            <p className="mt-3 text-gray-700 text-lg">
              Rochester and Finger Lakes employers can onboard operators with $49 online theory and an
              onsite practical—same OSHA framework as NYC and Buffalo.
            </p>
          </div>
        </section>
      )}
      {/* ──────────────── END NEW YORK SECTION ──────────────── */}

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Frequently Asked Questions - Forklift Certification in {info.name}</h2>
        <details className="group rounded-xl bg-white border-2 border-orange-200 p-5 hover:shadow-lg transition-all">
          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500 text-xl">❓</span>
            How do I get forklift certified in {info.name}?
          </summary>
          <p className="mt-3 pl-8 text-gray-700">
            To get forklift certified in {info.name}, simply enroll in our online OSHA-compliant course, complete the training in under 30 minutes, 
            and pass the exam. You'll instantly receive your printable certification valid throughout {info.name}.
          </p>
        </details>
        <details className="group rounded-xl bg-white border-2 border-orange-200 p-5 hover:shadow-lg transition-all">
          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500 text-xl">✓</span>
            Is this forklift certification accepted by OSHA inspectors in {info.name}?
          </summary>
          <p className="mt-3 pl-8 text-gray-700">
            Yes. Our curriculum follows 29 CFR 1910.178(l), recognized nationwide and accepted by OSHA inspectors in {info.name}.
            Be sure your operators complete hands-on evaluation per OSHA rules.
          </p>
        </details>
        <details className="group rounded-xl bg-white border-2 border-orange-200 p-5 hover:shadow-lg transition-all">
          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500 text-xl">⏱️</span>
            How long does it take to get forklift certified in {info.name}?
          </summary>
          <p className="mt-3 pl-8 text-gray-700">
            You can get forklift certified in {info.name} in under 30 minutes with our online course. 
            The training is self-paced, so you can complete it faster if needed.
          </p>
        </details>
        <details className="group rounded-xl bg-white border-2 border-orange-200 p-5 hover:shadow-lg transition-all">
          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500 text-xl">📅</span>
            How long is my {info.name} forklift certification valid?
          </summary>
          <p className="mt-3 pl-8 text-gray-700">
            Your {info.name} forklift certification is valid for three years, or sooner if the operator is involved in an accident or switches truck type.
          </p>
        </details>
        <details className="group rounded-xl bg-white border-2 border-orange-200 p-5 hover:shadow-lg transition-all">
          <summary className="cursor-pointer font-semibold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500 text-xl">📋</span>
            What are the requirements to get forklift certified in {info.name}?
          </summary>
          <p className="mt-3 pl-8 text-gray-700">
            To get forklift certified in {info.name}, you must be at least 18 years old, complete OSHA-compliant training, 
            pass a written exam, and receive hands-on evaluation from a qualified trainer at your workplace.
          </p>
        </details>
      </section>

      {/* ADDITIONAL CONTENT FOR SEO */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">{info.name} Forklift Certification Requirements</h2>
        <p className="text-gray-700">
          OSHA requires all forklift operators in {info.name} to complete formal training and evaluation before operating 
          powered industrial trucks. Our online forklift certification course meets these federal requirements and provides 
          the classroom instruction portion of your {info.name} forklift training.
        </p>
        
        {/* Industry Keywords for States Without Custom Content */}
        {!['ca', 'il', 'pa', 'oh', 'ga', 'nc', 'mi', 'va', 'ny', 'tx', 'fl', 'az', 'tn', 'nj', 'wi', 'in', 'wa'].includes(info.code) && (
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-blue-900">💼 Top Forklift Employers in {info.name}</h3>
              <p className="text-sm text-gray-700 mb-3">
                Major companies hiring certified forklift operators throughout {info.name}:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Amazon distribution centers</li>
                <li>• Walmart and Target warehouses</li>
                <li>• FedEx and UPS logistics facilities</li>
                <li>• Local manufacturing plants</li>
                <li>• Food processing and agriculture</li>
              </ul>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold mb-3 text-green-900">🎓 Get Certified in {info.name}</h3>
              <p className="text-sm text-gray-700 mb-3">
                Finding "forklift certification near me" in {info.name}? Our 100% online training means you can get certified from anywhere:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Train from home or workplace</li>
                <li>• No travel to training centers</li>
                <li>• Instant certificate download</li>
                <li>• Valid at all {info.name} job sites</li>
                <li>• Accepted by major employers</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm">
            <strong>Important:</strong> After completing our online course, you must also receive hands-on training and 
            evaluation from a qualified person at your workplace to be fully compliant with OSHA standards in {info.name}.
          </p>
        </div>
      </section>

      {/* Related States - Internal Linking for SEO */}
      <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Forklift Certification Near {info.name}</h3>
        <p className="text-sm text-slate-600 mb-4">
          Our OSHA-compliant training is accepted nationwide. Browse forklift certification for nearby states:
        </p>
        <div className="flex flex-wrap gap-2">
          {nearbyStates.map(ns => (
            <Link 
              key={ns.code} 
              href={`/safety/forklift/${ns.code}`} 
              className="text-sm px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-orange-50 hover:border-orange-400 transition-colors"
            >
              {ns.name}
            </Link>
          ))}
          <Link href="/safety/forklift" className="text-sm px-4 py-2 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-400 transition-colors font-medium">
            View All 50 States →
          </Link>
        </div>
      </section>

      {/* Last Updated Date - auto-generated */}
      <div className="text-center py-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} | Information current as of publish date
        </p>
      </div>

      {/* CALIFORNIA-SPECIFIC CONTENT */}
      {info.code === 'ca' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">California Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Logistics Operations</h3>
              <p className="text-sm text-gray-700">
                California's massive ports (Los Angeles, Long Beach, Oakland) require thousands of certified forklift operators. 
                Our training covers container handling, warehouse operations, and port-specific safety requirements.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Tech</h3>
              <p className="text-sm text-gray-700">
                From Silicon Valley tech companies to aerospace manufacturing, California's industrial sector demands 
                certified operators for material handling in warehouses and production facilities.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                California's Central Valley agricultural operations rely on forklifts for loading, unloading, and 
                warehouse operations. Our certification meets Cal/OSHA requirements for agricultural settings.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🛒 E-commerce & Distribution</h3>
              <p className="text-sm text-gray-700">
                Major distribution centers in Los Angeles, San Francisco, San Diego, and Fresno areas require 
                certified operators for Amazon, FedEx, UPS, and other logistics operations.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">California Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>
                  •{' '}
                  <a href="#los-angeles" className="underline hover:text-orange-700">
                    Los Angeles forklift certification
                  </a>
                </li>
                <li>• San Francisco forklift training</li>
                <li>
                  •{' '}
                  <a href="#san-diego" className="underline hover:text-orange-700">
                    San Diego forklift operators
                  </a>
                </li>
                <li>
                  •{' '}
                  <a href="#sacramento" className="underline hover:text-orange-700">
                    Sacramento forklift certification
                  </a>
                </li>
              </ul>
              <ul className="space-y-1">
                <li>• Fresno forklift training</li>
                <li>• Oakland port operations</li>
                <li>• Long Beach forklift operators</li>
                <li>• San Jose warehouse training</li>
              </ul>
              <ul className="space-y-1">
                <li>• Bakersfield agricultural sites</li>
                <li>• Stockton distribution centers</li>
                <li>• Riverside logistics hubs</li>
                <li>• Anaheim manufacturing</li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-gray-700">
              See also:{' '}
              <a href="#california-osha" className="underline hover:text-orange-700 font-medium">
                OSHA compliant / Cal/OSHA certification in California
              </a>
              .
            </p>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR CALIFORNIA */}
      {info.code === 'ca' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">California-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this OSHA approved or OSHA-compliant forklift certification?
            </summary>
            <p className="mt-2 text-gray-700">
              OSHA does not approve or endorse private training companies. What employers need is{' '}
              <strong>OSHA-compliant</strong> training under 29 CFR 1910.178(l): formal instruction plus a
              workplace practical evaluation. Our online course provides the formal instruction; your
              employer documents the hands-on evaluation. That is the compliant path California
              employers expect when they ask for &ldquo;OSHA approved&rdquo; certification.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Does this meet Cal/OSHA requirements for California?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes. California enforces powered industrial truck rules through Cal/OSHA under a state
              plan that meets or exceeds federal OSHA. Our curriculum covers the formal instruction
              employers use for Cal/OSHA-aligned compliance, paired with site-specific practical
              evaluation on your equipment.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Can I get forklift certified online in Los Angeles, San Diego, or Sacramento?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes for the theory portion. Operators across Los Angeles, San Diego, Sacramento, and
              the rest of California complete online instruction, then finish the required practical
              evaluation with a qualified person at their workplace.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is forklift certification required at California ports and warehouses?
            </summary>
            <p className="mt-2 text-gray-700">
              Employers at major California ports (LA, Long Beach, Oakland) and warehouse operations
              require trained, evaluated operators. Online theory speeds onboarding; the practical
              eval stays on your site.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do I need additional training for agricultural forklift work in California?
            </summary>
            <p className="mt-2 text-gray-700">
              Our OSHA-compliant training covers the fundamentals for all industries, including
              agriculture. Some California agricultural employers may still require additional
              site-specific training for outdoor conditions or product handling.
            </p>
          </details>
        </section>
      )}

      {/* ILLINOIS-SPECIFIC CONTENT */}
      {info.code === 'il' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Illinois Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚛 Transportation & Logistics</h3>
              <p className="text-sm text-gray-700">
                Chicago is America's transportation hub with massive rail yards, trucking terminals, and distribution centers. 
                Our training prepares operators for high-volume logistics operations throughout Illinois.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Steel</h3>
              <p className="text-sm text-gray-700">
                Illinois manufacturing includes automotive plants, machinery production, and steel mills. 
                Our certification covers heavy-duty forklift operations in industrial settings.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌽 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Illinois leads in corn and soybean production with extensive food processing facilities. 
                Our training covers agricultural and food industry forklift safety requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📦 Warehousing & Distribution</h3>
              <p className="text-sm text-gray-700">
                Major retailers and e-commerce companies operate massive distribution centers throughout Illinois. 
                Our certification meets requirements for Amazon, Walmart, and other major employers.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Illinois Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>
                  •{' '}
                  <a href="#chicago" className="underline hover:text-orange-700">
                    Chicago forklift certification
                  </a>
                </li>
                <li>• Aurora forklift training</li>
                <li>• Rockford forklift operators</li>
                <li>• Joliet forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Naperville warehouse training</li>
                <li>• Springfield forklift operators</li>
                <li>• Peoria manufacturing sites</li>
                <li>• Elgin distribution centers</li>
              </ul>
              <ul className="space-y-1">
                <li>• Waukegan logistics hubs</li>
                <li>• Cicero industrial areas</li>
                <li>• Schaumburg warehouses</li>
                <li>• Decatur food processing</li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-gray-700">
              See also:{' '}
              <a href="#illinois-online" className="underline hover:text-orange-700 font-medium">
                statewide Illinois certification
              </a>
              .
            </p>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR ILLINOIS */}
      {info.code === 'il' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Illinois-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              How do I get forklift certified in Chicago online?
            </summary>
            <p className="mt-2 text-gray-700">
              Complete OSHA-compliant online theory for $49, pass the exam, download your certificate,
              then have a qualified person at your Chicago workplace complete the hands-on practical
              evaluation.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Chicago warehouses and distribution centers?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes for the theory portion. Chicago logistics and warehouse employers still complete the
              required practical evaluation on your equipment under OSHA 29 CFR 1910.178(l).
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Illinois manufacturing plants require forklift certification?
            </summary>
            <p className="mt-2 text-gray-700">
              Employers operating powered industrial trucks must ensure operators are trained and
              evaluated. Online theory plus an employer practical is the common compliant path.
            </p>
          </details>
        </section>
      )}

      {/* PENNSYLVANIA-SPECIFIC CONTENT */}
      {info.code === 'pa' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Pennsylvania Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Steel</h3>
              <p className="text-sm text-gray-700">
                Pennsylvania's industrial legacy includes major steel production, machinery manufacturing, and chemical processing. 
                Our training covers heavy-duty forklift operations in Pittsburgh's steel mills and statewide manufacturing facilities.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Logistics</h3>
              <p className="text-sm text-gray-700">
                Philadelphia's port operations and Pennsylvania's position as an East Coast logistics hub require thousands 
                of certified forklift operators for container handling and warehouse operations.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Pennsylvania's diverse agriculture includes dairy operations, mushroom farming, and food processing facilities. 
                Our certification covers agricultural forklift safety for Pennsylvania's farming operations.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">⚡ Energy & Utilities</h3>
              <p className="text-sm text-gray-700">
                Pennsylvania's energy sector includes natural gas operations, coal handling, and renewable energy facilities. 
                Our training prepares operators for material handling in energy industry settings.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Pennsylvania Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Philadelphia forklift certification</li>
                <li>• Pittsburgh forklift training</li>
                <li>• Allentown forklift operators</li>
                <li>• Erie forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Reading warehouse training</li>
                <li>• Scranton forklift operators</li>
                <li>• Bethlehem steel operations</li>
                <li>• Lancaster agricultural sites</li>
              </ul>
              <ul className="space-y-1">
                <li>• Harrisburg distribution centers</li>
                <li>• York manufacturing facilities</li>
                <li>• Chester port operations</li>
                <li>• Wilkes-Barre logistics hubs</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR PENNSYLVANIA */}
      {info.code === 'pa' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Pennsylvania-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Philadelphia port operations and warehouses?
            </summary>
            <p className="mt-2">
              Yes! Our OSHA-compliant certification is accepted by major employers throughout Pennsylvania, 
              including port operations in Philadelphia, logistics companies, and warehouse facilities 
              across the state's major industrial corridors.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Pennsylvania steel mills and manufacturing plants require forklift certification?
            </summary>
            <p className="mt-2">
              Absolutely. Pennsylvania's manufacturing sector, including steel mills in Pittsburgh, chemical plants, 
              and machinery manufacturers throughout the state, require OSHA-compliant forklift certification. 
              Our training covers heavy industrial safety requirements.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Pennsylvania's energy sector operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in industrial settings, including 
              Pennsylvania's energy sector. The certification is valid for natural gas facilities, coal operations, 
              and renewable energy projects throughout Pennsylvania.
            </p>
          </details>
        </section>
      )}

      {/* OHIO-SPECIFIC CONTENT */}
      {info.code === 'oh' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Ohio Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚗 Automotive & Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Ohio is a major automotive manufacturing hub with plants from Honda, Ford, GM, and suppliers throughout the state. 
                Our training covers automotive industry forklift safety requirements and lean manufacturing environments.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚛 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Ohio's central location makes it a major distribution hub for the Midwest and East Coast. 
                Our certification prepares operators for high-volume warehouse operations and cross-docking facilities.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Ohio's diverse agriculture includes corn, soybeans, and livestock operations with extensive food processing facilities. 
                Our training covers agricultural forklift safety and food industry requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">⚡ Energy & Chemical Processing</h3>
              <p className="text-sm text-gray-700">
                Ohio's energy sector includes coal operations, natural gas processing, and renewable energy facilities. 
                Our certification covers material handling safety in energy and chemical processing environments.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Ohio Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Columbus forklift certification</li>
                <li>• Cleveland forklift training</li>
                <li>• Cincinnati forklift operators</li>
                <li>• Toledo forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Akron warehouse training</li>
                <li>• Dayton forklift operators</li>
                <li>• Parma manufacturing sites</li>
                <li>• Canton distribution centers</li>
              </ul>
              <ul className="space-y-1">
                <li>• Youngstown steel operations</li>
                <li>• Lorain automotive plants</li>
                <li>• Hamilton logistics hubs</li>
                <li>• Springfield food processing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR OHIO */}
      {info.code === 'oh' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Ohio-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Ohio automotive plants and manufacturing facilities?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major Ohio automotive manufacturers 
              including Honda, Ford, GM, and their suppliers throughout Ohio. The training meets automotive 
              industry safety standards and lean manufacturing requirements.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Ohio distribution centers and logistics companies require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Ohio's strategic location makes it a major distribution hub, and logistics companies like 
              Amazon, FedEx, UPS, and DHL require certified forklift operators. Our certification is accepted 
              at major distribution centers throughout Ohio.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Ohio's energy and chemical processing industries?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in industrial environments, including 
              Ohio's energy and chemical sectors. The certification is valid for coal operations, natural gas 
              facilities, and chemical processing plants throughout Ohio.
            </p>
          </details>
        </section>
      )}

      {/* GEORGIA-SPECIFIC CONTENT */}
      {info.code === 'ga' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Georgia Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚛 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Georgia is a major Southeast distribution hub with the Port of Savannah and Atlanta's logistics corridor. 
                Our training prepares operators for high-volume container handling, cross-docking, and e-commerce fulfillment operations.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Automotive</h3>
              <p className="text-sm text-gray-700">
                Georgia's manufacturing sector includes automotive plants, aerospace facilities, and machinery production. 
                Our certification covers industrial forklift safety requirements and lean manufacturing environments.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🍑 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Georgia's agriculture includes peaches, peanuts, poultry operations, and extensive food processing facilities. 
                Our training covers agricultural forklift safety and food industry compliance requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">✈️ Aerospace & Defense</h3>
              <p className="text-sm text-gray-700">
                Georgia's aerospace and defense sector requires precision material handling in manufacturing and maintenance facilities. 
                Our certification covers specialized forklift operations for aerospace components and defense contractors.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Georgia Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Atlanta forklift certification</li>
                <li>• Savannah forklift training</li>
                <li>• Augusta forklift operators</li>
                <li>• Columbus forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Athens warehouse training</li>
                <li>• Macon forklift operators</li>
                <li>• Albany distribution centers</li>
                <li>• Warner Robins aerospace facilities</li>
              </ul>
              <ul className="space-y-1">
                <li>• Roswell logistics hubs</li>
                <li>• Sandy Springs manufacturing</li>
                <li>• Marietta aerospace operations</li>
                <li>• Valdosta food processing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR GEORGIA */}
      {info.code === 'ga' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Georgia-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at the Port of Savannah and Atlanta distribution centers?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Georgia, 
              including port operations in Savannah, logistics companies in Atlanta's distribution corridor, 
              and warehouse facilities across Georgia's major transportation hubs.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Georgia manufacturing and aerospace facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Georgia's manufacturing sector, including automotive plants, aerospace facilities like those 
              in Warner Robins, and defense contractors throughout the state, require OSHA-compliant forklift 
              certification. Our training meets aerospace and automotive industry safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Georgia's food processing and agricultural operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in food processing and agricultural 
              settings, which is essential for Georgia's significant agriculture and food industry. The 
              certification is valid for poultry operations, food processing plants, and agricultural facilities throughout Georgia.
            </p>
          </details>
        </section>
      )}

      {/* NORTH CAROLINA-SPECIFIC CONTENT */}
      {info.code === 'nc' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">North Carolina Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏦 Banking & Financial Services</h3>
              <p className="text-sm text-gray-700">
                Charlotte is a major financial center with Bank of America headquarters and Wells Fargo operations. 
                Our training covers warehouse and logistics operations for financial institutions and corporate facilities.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">💻 Technology & Research</h3>
              <p className="text-sm text-gray-700">
                The Research Triangle (Raleigh-Durham-Chapel Hill) is a major tech hub with pharmaceutical, biotech, and software companies. 
                Our certification covers high-tech manufacturing and clean room logistics operations.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Textiles</h3>
              <p className="text-sm text-gray-700">
                North Carolina's manufacturing includes furniture, textiles, automotive parts, and aerospace components. 
                Our training covers industrial forklift safety for traditional and advanced manufacturing facilities.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🎖️ Military & Defense</h3>
              <p className="text-sm text-gray-700">
                North Carolina hosts major military installations including Fort Liberty and Camp Lejeune. 
                Our certification covers material handling for defense contractors and military logistics operations.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">North Carolina Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Charlotte forklift certification</li>
                <li>• Raleigh forklift training</li>
                <li>• Greensboro forklift operators</li>
                <li>• Durham forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Winston-Salem warehouse training</li>
                <li>• Fayetteville forklift operators</li>
                <li>• Cary manufacturing sites</li>
                <li>• High Point distribution centers</li>
              </ul>
              <ul className="space-y-1">
                <li>• Wilmington logistics hubs</li>
                <li>• Asheville manufacturing</li>
                <li>• Gastonia textile operations</li>
                <li>• Rocky Mount food processing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR NORTH CAROLINA */}
      {info.code === 'nc' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">North Carolina-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Charlotte financial institutions and Research Triangle tech companies?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout North Carolina, 
              including financial institutions in Charlotte, tech companies in the Research Triangle, and corporate 
              facilities across the state's major business centers.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do North Carolina manufacturing and defense facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! North Carolina's manufacturing sector, including furniture makers, textile companies, automotive 
              suppliers, and defense contractors serving military installations, require OSHA-compliant forklift 
              certification. Our training meets defense industry and advanced manufacturing safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for North Carolina's pharmaceutical and biotech operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in controlled environments, which is 
              important for North Carolina's significant pharmaceutical and biotech industries in the Research Triangle. 
              The certification is valid for clean room logistics and high-tech manufacturing throughout North Carolina.
            </p>
          </details>
        </section>
      )}

      {/* MICHIGAN-SPECIFIC CONTENT */}
      {info.code === 'mi' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Michigan Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚗 Automotive Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Michigan is the heart of American automotive manufacturing with Ford, GM, Chrysler headquarters and hundreds of suppliers. 
                Our training covers automotive assembly line safety, parts warehousing, and lean manufacturing forklift operations.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Heavy Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Michigan's industrial base includes steel processing, machinery manufacturing, and chemical production. 
                Our certification covers heavy-duty forklift operations in industrial manufacturing environments.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Michigan's agriculture includes cherries, apples, corn, and extensive food processing facilities. 
                Our training covers agricultural forklift safety and food industry compliance requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Logistics & Shipping</h3>
              <p className="text-sm text-gray-700">
                Michigan's Great Lakes shipping, ports in Detroit and Grand Haven, plus logistics centers require certified operators. 
                Our certification covers port operations, cross-docking, and intermodal freight handling.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Michigan Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Detroit forklift certification</li>
                <li>• Grand Rapids forklift training</li>
                <li>• Warren forklift operators</li>
                <li>• Sterling Heights forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Lansing warehouse training</li>
                <li>• Ann Arbor forklift operators</li>
                <li>• Livonia manufacturing sites</li>
                <li>• Dearborn automotive plants</li>
              </ul>
              <ul className="space-y-1">
                <li>• Flint logistics hubs</li>
                <li>• Kalamazoo manufacturing</li>
                <li>• Troy automotive operations</li>
                <li>• Pontiac distribution centers</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR MICHIGAN */}
      {info.code === 'mi' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Michigan-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Michigan automotive plants and assembly facilities?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major Michigan automotive manufacturers 
              including Ford, GM, Chrysler, and their tier-one suppliers throughout Michigan. The training meets 
              automotive industry safety standards and lean manufacturing requirements.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Michigan manufacturing and steel processing facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Michigan's heavy manufacturing sector, including steel processing, machinery manufacturers, 
              and chemical plants throughout the state, require OSHA-compliant forklift certification. Our training 
              covers heavy industrial safety requirements common in Michigan's manufacturing base.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Michigan's Great Lakes shipping and port operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in shipping and logistics environments, 
              which is essential for Michigan's Great Lakes ports and shipping operations. The certification is 
              valid for port operations, intermodal freight handling, and logistics centers throughout Michigan.
            </p>
          </details>
        </section>
      )}

      {/* VIRGINIA-SPECIFIC CONTENT */}
      {info.code === 'va' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Virginia Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🎖️ Military & Defense</h3>
              <p className="text-sm text-gray-700">
                Virginia hosts major military installations including Norfolk Naval Base, Pentagon, Quantico, and Fort Belvoir. 
                Our training covers defense contractor logistics, military base operations, and shipyard material handling requirements.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Maritime Operations</h3>
              <p className="text-sm text-gray-700">
                The Port of Virginia (Norfolk, Newport News) is a major East Coast shipping hub with container terminals and cargo operations. 
                Our certification covers port logistics, container handling, and maritime freight operations.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏛️ Government & Federal Contracting</h3>
              <p className="text-sm text-gray-700">
                Northern Virginia's proximity to Washington DC creates extensive federal contracting and government facility operations. 
                Our training covers government warehouse requirements and federal contractor logistics standards.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚀 Technology & Data Centers</h3>
              <p className="text-sm text-gray-700">
                Northern Virginia's technology corridor includes major data centers, tech companies, and telecommunications facilities. 
                Our certification covers high-tech warehouse operations and precision equipment handling.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Virginia Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Virginia Beach forklift certification</li>
                <li>• Norfolk forklift training</li>
                <li>• Chesapeake forklift operators</li>
                <li>• Richmond forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Newport News warehouse training</li>
                <li>• Alexandria forklift operators</li>
                <li>• Hampton port operations</li>
                <li>• Portsmouth naval facilities</li>
              </ul>
              <ul className="space-y-1">
                <li>• Suffolk logistics hubs</li>
                <li>• Roanoke manufacturing</li>
                <li>• Fairfax federal contractors</li>
                <li>• Lynchburg distribution centers</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR VIRGINIA */}
      {info.code === 'va' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Virginia-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Virginia military installations and defense contractors?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Virginia, 
              including defense contractors serving Norfolk Naval Base, Pentagon operations, Quantico, and other 
              military installations. The training meets defense industry security and safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Virginia port operations and shipbuilding facilities require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Virginia's port operations, including the Port of Virginia and Newport News Shipbuilding, 
              require OSHA-compliant forklift certification. Our training covers maritime logistics, container 
              handling, and shipyard safety requirements specific to Virginia's maritime industry.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Virginia's federal contracting and government facilities?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in government and federal contracting 
              environments, which is essential for Northern Virginia's extensive federal contractor base. The 
              certification meets government facility requirements and federal contractor standards throughout Virginia.
            </p>
          </details>
        </section>
      )}

      {/* NEW YORK-SPECIFIC CONTENT */}
      {info.code === 'ny' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">New York Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏦 Financial Services & Banking</h3>
              <p className="text-sm text-gray-700">
                New York City is the global financial capital with Wall Street, major banks, and corporate headquarters. 
                Our training covers corporate warehouse operations, financial institution logistics, and high-security facility requirements.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Logistics Operations</h3>
              <p className="text-sm text-gray-700">
                The Port of New York/New Jersey is one of the largest container ports in North America. 
                Our certification covers port logistics, container handling, intermodal operations, and maritime freight management.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Heavy Industry</h3>
              <p className="text-sm text-gray-700">
                Upstate New York's manufacturing includes automotive parts, electronics, machinery, and chemical production. 
                Our training covers heavy industrial forklift operations and manufacturing safety requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                New York's agriculture includes dairy, apples, wine production, and extensive food processing facilities. 
                Our certification covers agricultural forklift safety and food industry compliance standards.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">New York Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>
                  •{' '}
                  <a href="#nyc" className="underline hover:text-orange-700">
                    New York City forklift certification
                  </a>
                </li>
                <li>
                  •{' '}
                  <a href="#buffalo" className="underline hover:text-orange-700">
                    Buffalo forklift training
                  </a>
                </li>
                <li>
                  •{' '}
                  <a href="#rochester" className="underline hover:text-orange-700">
                    Rochester forklift operators
                  </a>
                </li>
                <li>• Yonkers forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Syracuse warehouse training</li>
                <li>• Albany forklift operators</li>
                <li>• New Rochelle port operations</li>
                <li>• Mount Vernon logistics hubs</li>
              </ul>
              <ul className="space-y-1">
                <li>• Schenectady manufacturing</li>
                <li>• Utica distribution centers</li>
                <li>• White Plains corporate facilities</li>
                <li>• Troy industrial operations</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR NEW YORK */}
      {info.code === 'ny' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">New York-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Can I get forklift certified online in New York City?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes for the theory portion. NYC operators complete online OSHA instruction for $49, then
              finish the required practical evaluation with a qualified person at their workplace.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is online forklift certification valid in Buffalo and Rochester?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes statewide for formal instruction when paired with a workplace practical evaluation
              under OSHA 29 CFR 1910.178(l).
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do New York warehouses and port-adjacent sites require forklift certification?
            </summary>
            <p className="mt-2 text-gray-700">
              Employers operating powered industrial trucks must ensure operators are trained and
              evaluated. Online theory plus an employer practical is the common compliant path.
            </p>
          </details>
        </section>
      )}

      {/* TEXAS-SPECIFIC CONTENT */}
      {info.code === 'tx' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Texas Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">⚡ Energy & Oil/Gas</h3>
              <p className="text-sm text-gray-700">
                Texas leads the nation in energy production with extensive oil refineries, natural gas facilities, and renewable energy operations. 
                Our training covers material handling safety in energy sector environments, including Houston's petrochemical corridor.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚛 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Texas's central location and major ports (Houston, Corpus Christi) make it a logistics powerhouse. 
                Our certification covers warehouse operations, cross-docking, and container handling for Texas's massive distribution sector.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Technology</h3>
              <p className="text-sm text-gray-700">
                From Austin's tech corridor to aerospace in Fort Worth, Texas manufacturing is diverse and growing. 
                Our training covers high-tech manufacturing, semiconductor facilities, and automotive production environments.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Texas's vast agriculture sector includes cattle, cotton, and extensive food processing facilities. 
                Our certification covers agricultural forklift operations and food industry compliance requirements throughout Texas.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Texas Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>
                  •{' '}
                  <a href="#houston" className="underline hover:text-orange-700">
                    Houston forklift certification
                  </a>
                </li>
                <li>
                  •{' '}
                  <a href="#dfw" className="underline hover:text-orange-700">
                    Dallas forklift training
                  </a>
                </li>
                <li>• Austin forklift operators</li>
                <li>• San Antonio forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Fort Worth warehouse training</li>
                <li>• El Paso forklift operators</li>
                <li>• Arlington distribution centers</li>
                <li>• Corpus Christi port operations</li>
              </ul>
              <ul className="space-y-1">
                <li>• Plano logistics hubs</li>
                <li>• Laredo border facilities</li>
                <li>• Irving manufacturing</li>
                <li>• Lubbock agricultural operations</li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-gray-700">
              See also:{' '}
              <a href="#texas-online" className="underline hover:text-orange-700 font-medium">
                how to get forklift certified in Texas online
              </a>
              .
            </p>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR TEXAS */}
      {info.code === 'tx' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Texas-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              How do I get forklift certified in Texas online?
            </summary>
            <p className="mt-2 text-gray-700">
              Complete OSHA-compliant online theory for $49, pass the exam, download your certificate,
              then have a qualified person at your Texas workplace complete the hands-on practical
              evaluation. That combination meets the federal OSHA training framework employers use
              statewide.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is online forklift certification accepted in Houston and Dallas–Fort Worth?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes for the classroom/theory portion. Houston and DFW employers still complete the
              required practical evaluation on your equipment. Online theory is often faster than
              local classroom seats for multi-shift warehouses and plants.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Houston energy facilities and petrochemical plants?
            </summary>
            <p className="mt-2 text-gray-700">
              Our OSHA-compliant formal instruction is used by Texas employers across logistics and
              industrial sites, including energy-corridor workplaces. Site-specific practical
              evaluation and any plant rules still sit with your employer.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Texas logistics companies and distribution centers require forklift certification?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes. Distribution and warehouse employers in Dallas–Fort Worth, Houston, San Antonio,
              and across Texas expect OSHA-compliant training plus a documented workplace evaluation.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Texas technology and semiconductor manufacturing?
            </summary>
            <p className="mt-2 text-gray-700">
              OSHA theory covers powered industrial truck fundamentals. High-tech or clean-room sites
              may add their own site-specific rules after you complete online instruction and the
              employer practical.
            </p>
          </details>
        </section>
      )}

      {/* FLORIDA-SPECIFIC CONTENT */}
      {info.code === 'fl' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Florida Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Maritime Operations</h3>
              <p className="text-sm text-gray-700">
                Florida's extensive port system (Miami, Tampa, Jacksonville, Port Everglades) handles massive cargo volumes. 
                Our training covers container handling, cruise line logistics, and maritime freight operations throughout Florida.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">✈️ Tourism & Hospitality</h3>
              <p className="text-sm text-gray-700">
                Florida's tourism industry requires extensive warehouse operations for theme parks, hotels, and convention centers. 
                Our certification covers hospitality logistics, theme park operations, and resort facility material handling.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌴 Agriculture & Food Distribution</h3>
              <p className="text-sm text-gray-700">
                Florida's agriculture includes citrus, vegetables, and extensive food distribution networks. 
                Our training covers agricultural forklift safety and temperature-controlled warehouse operations for produce distribution.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📦 E-commerce & Logistics</h3>
              <p className="text-sm text-gray-700">
                Florida's strategic location for Latin American trade and growing e-commerce presence require certified operators. 
                Our certification covers distribution center operations, cross-border logistics, and fulfillment centers.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Florida Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>
                  •{' '}
                  <a href="#miami" className="underline hover:text-orange-700">
                    Miami forklift certification
                  </a>
                </li>
                <li>
                  •{' '}
                  <a href="#jacksonville" className="underline hover:text-orange-700">
                    Jacksonville forklift training
                  </a>
                </li>
                <li>
                  •{' '}
                  <a href="#tampa" className="underline hover:text-orange-700">
                    Tampa forklift operators
                  </a>
                </li>
                <li>• Orlando forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• St. Petersburg warehouse training</li>
                <li>• Fort Lauderdale port operations</li>
                <li>• Hialeah distribution centers</li>
                <li>• Port St. Lucie logistics</li>
              </ul>
              <ul className="space-y-1">
                <li>• Tallahassee government facilities</li>
                <li>• Cape Coral manufacturing</li>
                <li>• Pembroke Pines warehouses</li>
                <li>• Hollywood logistics hubs</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR FLORIDA */}
      {info.code === 'fl' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Florida-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Can I get forklift certified online in Miami?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes for the theory portion. Miami operators complete online OSHA instruction for $49,
              then finish the required practical evaluation at their workplace.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is online forklift certification accepted in Jacksonville and Tampa?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes statewide for formal instruction when paired with a workplace practical evaluation
              under OSHA 29 CFR 1910.178(l).
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Florida warehouses and port-adjacent sites require forklift certification?
            </summary>
            <p className="mt-2 text-gray-700">
              Employers operating powered industrial trucks must ensure operators are trained and
              evaluated. Online theory plus an employer practical is the common compliant path.
            </p>
          </details>
        </section>
      )}

      {/* ARIZONA-SPECIFIC CONTENT */}
      {info.code === 'az' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Arizona Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📦 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Arizona's strategic location for Southwest distribution makes Phoenix a major logistics hub. 
                Our training covers warehouse operations, cross-docking, and e-commerce fulfillment for Amazon, Walmart, and regional distributors.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Electronics</h3>
              <p className="text-sm text-gray-700">
                Arizona's growing manufacturing sector includes semiconductor facilities, electronics, and aerospace components. 
                Our certification covers high-tech manufacturing and precision equipment handling requirements.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">⛏️ Mining & Construction</h3>
              <p className="text-sm text-gray-700">
                Arizona's copper mining and construction industries require heavy equipment material handling. 
                Our training covers industrial forklift operations in mining support facilities and construction supply warehouses.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌵 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Arizona's agriculture includes lettuce, cotton, and cattle operations with extensive food processing facilities. 
                Our certification covers agricultural forklift safety and temperature-controlled warehouse operations.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Arizona Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>
                  •{' '}
                  <a href="#phoenix" className="underline hover:text-orange-700">
                    Phoenix forklift certification
                  </a>
                </li>
                <li>
                  •{' '}
                  <a href="#tucson" className="underline hover:text-orange-700">
                    Tucson forklift training
                  </a>
                </li>
                <li>• Mesa forklift operators</li>
                <li>• Chandler forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Scottsdale warehouse training</li>
                <li>• Glendale distribution centers</li>
                <li>• Gilbert logistics facilities</li>
                <li>• Tempe manufacturing sites</li>
              </ul>
              <ul className="space-y-1">
                <li>• Peoria logistics hubs</li>
                <li>• Surprise warehouses</li>
                <li>• Goodyear industrial parks</li>
                <li>• Avondale manufacturing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR ARIZONA */}
      {info.code === 'az' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Arizona-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              How do I get forklift certified in Phoenix online?
            </summary>
            <p className="mt-2 text-gray-700">
              Complete OSHA-compliant online theory for $49, pass the exam, download your certificate,
              then have a qualified person at your Phoenix workplace complete the hands-on practical
              evaluation—often faster than local in-person classroom seats.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Phoenix distribution centers and logistics facilities?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes for the theory portion. Phoenix metro employers still complete the required practical
              evaluation on your equipment under OSHA 29 CFR 1910.178(l).
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Can Tucson operators use the same online forklift certification?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes. Tucson and the rest of Arizona use the same online theory + workplace practical
              path.
            </p>
          </details>
        </section>
      )}

      {/* TENNESSEE-SPECIFIC CONTENT */}
      {info.code === 'tn' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Tennessee Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚗 Automotive Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Tennessee is home to Nissan, Volkswagen, and GM plants with hundreds of automotive suppliers. 
                Our training covers automotive assembly operations, parts warehousing, and lean manufacturing environments throughout Tennessee.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚛 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Nashville and Memphis are major logistics hubs with FedEx headquarters and extensive distribution networks. 
                Our certification covers high-volume warehouse operations, package handling, and freight distribution.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🎸 Manufacturing & Production</h3>
              <p className="text-sm text-gray-700">
                Tennessee's diverse manufacturing includes chemicals, plastics, and consumer goods production. 
                Our training covers industrial forklift safety for Tennessee's varied manufacturing environments.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌾 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Tennessee's agriculture and food processing industries require certified forklift operators for warehouse operations. 
                Our certification covers agricultural and food industry safety requirements throughout Tennessee.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Tennessee Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>
                  •{' '}
                  <a href="#nashville" className="underline hover:text-orange-700">
                    Nashville forklift certification
                  </a>
                </li>
                <li>
                  •{' '}
                  <a href="#memphis" className="underline hover:text-orange-700">
                    Memphis forklift license / training
                  </a>
                </li>
                <li>• Knoxville forklift operators</li>
                <li>• Chattanooga forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Clarksville warehouse training</li>
                <li>• Murfreesboro distribution centers</li>
                <li>• Franklin logistics facilities</li>
                <li>• Jackson manufacturing sites</li>
              </ul>
              <ul className="space-y-1">
                <li>• Johnson City operations</li>
                <li>• Smyrna automotive plants</li>
                <li>• Kingsport manufacturing</li>
                <li>• Spring Hill production facilities</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR TENNESSEE */}
      {info.code === 'tn' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Tennessee-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              How do I get a forklift license in Memphis, TN?
            </summary>
            <p className="mt-2 text-gray-700">
              There is no DMV forklift license. Complete OSHA-compliant online theory for $49, pass
              the exam, download your certificate, then have a qualified person at your Memphis
              workplace complete the hands-on practical evaluation.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Tennessee automotive plants and manufacturing facilities?
            </summary>
            <p className="mt-2 text-gray-700">
              Our OSHA-compliant formal instruction is used by Tennessee automotive and manufacturing
              employers. Site-specific practical evaluation and plant rules still sit with your employer.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Memphis logistics companies require forklift certification?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes. Memphis and Nashville logistics employers expect OSHA-compliant training plus a
              documented workplace evaluation for powered industrial truck operators.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Tennessee manufacturing environments?
            </summary>
            <p className="mt-2 text-gray-700">
              OSHA theory covers PIT fundamentals. Chemical or heavy industrial sites may add their
              own site-specific rules after online instruction and the employer practical.
            </p>
          </details>
        </section>
      )}

      {/* NEW JERSEY-SPECIFIC CONTENT */}
      {info.code === 'nj' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">New Jersey Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Logistics Operations</h3>
              <p className="text-sm text-gray-700">
                New Jersey shares the Port of New York/New Jersey, one of the largest container ports in North America. 
                Our training covers port logistics, container handling, and intermodal freight operations throughout New Jersey.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">💊 Pharmaceutical & Life Sciences</h3>
              <p className="text-sm text-gray-700">
                New Jersey is a global pharmaceutical hub with major companies like Johnson & Johnson, Merck, and Bristol Myers Squibb. 
                Our certification covers clean room logistics, controlled substance handling, and pharmaceutical warehouse operations.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Manufacturing & Chemical Processing</h3>
              <p className="text-sm text-gray-700">
                New Jersey's industrial corridor includes chemical processing, food production, and consumer goods manufacturing. 
                Our training covers heavy industrial forklift safety and chemical facility material handling requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📦 E-commerce & Distribution</h3>
              <p className="text-sm text-gray-700">
                New Jersey's proximity to NYC makes it a major e-commerce fulfillment and distribution center location. 
                Our certification covers high-volume warehouse operations for Amazon, Walmart, and regional distributors.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">New Jersey Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>
                  •{' '}
                  <a href="#newark" className="underline hover:text-orange-700">
                    Newark forklift certification
                  </a>
                </li>
                <li>• Jersey City forklift training</li>
                <li>• Paterson forklift operators</li>
                <li>• Elizabeth forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Edison warehouse training</li>
                <li>• Woodbridge distribution centers</li>
                <li>• Lakewood logistics facilities</li>
                <li>• Toms River operations</li>
              </ul>
              <ul className="space-y-1">
                <li>• Hamilton pharmaceutical sites</li>
                <li>• Trenton manufacturing</li>
                <li>• Camden port operations</li>
                <li>• Clifton industrial facilities</li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-gray-700">
              See also:{' '}
              <a href="#nj-how-to" className="underline hover:text-orange-700 font-medium">
                how to get forklift certification in NJ
              </a>
              .
            </p>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR NEW JERSEY */}
      {info.code === 'nj' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">New Jersey-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              How do I get forklift certification in NJ?
            </summary>
            <p className="mt-2 text-gray-700">
              Complete OSHA-compliant online theory for $49, pass the exam, download your certificate,
              then have a qualified person at your New Jersey workplace complete the hands-on practical
              evaluation. That is the path employers mean when they ask how to get certified in NJ.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Can I get forklift certified online in Newark or Jersey City?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes for the theory portion. Newark, Jersey City, Elizabeth, and other NJ operators finish
              online instruction, then complete the required practical evaluation on site.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at New Jersey pharmaceutical and biotech facilities?
            </summary>
            <p className="mt-2 text-gray-700">
              Our OSHA-compliant formal instruction is used by life-sciences and warehouse employers
              statewide. Clean-room or controlled-substance sites may add their own site rules after
              the employer practical.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do New Jersey port operations and logistics companies require forklift certification?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes. Port-adjacent and distribution employers in New Jersey expect OSHA-compliant
              training plus a documented workplace evaluation.
            </p>
          </details>
        </section>
      )}

      {/* WISCONSIN INDUSTRY + FAQ */}
      {info.code === 'wi' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Wisconsin Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Manufacturing &amp; Metalworking</h3>
              <p className="text-sm text-gray-700">
                Milwaukee and Southeast Wisconsin manufacturers need certified operators for plant and
                warehouse material handling. Online theory plus an onsite practical fits multi-shift crews.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Warehousing &amp; Distribution</h3>
              <p className="text-sm text-gray-700">
                Distribution centers across Milwaukee, Madison, and Green Bay expect OSHA-compliant
                training with documented workplace evaluation.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Food &amp; Dairy Processing</h3>
              <p className="text-sm text-gray-700">
                Wisconsin food and dairy employers use the same federal OSHA PIT framework—online
                instruction, then site-specific practical evaluation.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Paper &amp; Industrial</h3>
              <p className="text-sm text-gray-700">
                Industrial sites statewide can onboard operators quickly with $49 online theory and an
                employer checklist for the hands-on eval.
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Wisconsin Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>
                  •{' '}
                  <a href="#milwaukee" className="underline hover:text-orange-700">
                    Milwaukee forklift training
                  </a>
                </li>
                <li>• Madison forklift certification</li>
                <li>• Green Bay forklift operators</li>
              </ul>
              <ul className="space-y-1">
                <li>• Appleton warehouse training</li>
                <li>• Racine manufacturing</li>
                <li>• Kenosha logistics</li>
              </ul>
              <ul className="space-y-1">
                <li>• Eau Claire distribution</li>
                <li>• Waukesha industrial sites</li>
                <li>• Oshkosh operations</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {info.code === 'wi' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Wisconsin-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Where can I get forklift training in Milwaukee online?
            </summary>
            <p className="mt-2 text-gray-700">
              Complete OSHA-compliant online theory for $49, pass the exam, then have a qualified
              person at your Milwaukee workplace complete the hands-on practical evaluation. That
              covers the formal instruction employers expect.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is online forklift certification valid across Wisconsin?
            </summary>
            <p className="mt-2 text-gray-700">
              Yes for the theory portion statewide—including Madison, Green Bay, and Appleton—when
              paired with a workplace practical evaluation under OSHA 29 CFR 1910.178(l).
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Wisconsin manufacturers and warehouses require forklift certification?
            </summary>
            <p className="mt-2 text-gray-700">
              Employers operating powered industrial trucks must ensure operators are trained and
              evaluated. Online theory plus an employer practical is the common compliant path.
            </p>
          </details>
        </section>
      )}

      {/* INDIANA-SPECIFIC CONTENT */}
      {info.code === 'in' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Indiana Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚗 Automotive & Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Indiana is a major automotive and RV manufacturing hub with plants from Toyota, Honda, Subaru, and major RV manufacturers. 
                Our training covers automotive assembly, parts warehousing, and lean manufacturing environments throughout Indiana.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📦 Logistics & Distribution</h3>
              <p className="text-sm text-gray-700">
                Indiana's central location makes Indianapolis a major distribution hub for the Midwest and national networks. 
                Our certification covers warehouse operations, cross-docking, and e-commerce fulfillment throughout Indiana.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🏭 Steel & Heavy Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Indiana's steel industry and heavy manufacturing sector in Gary, Hammond, and throughout northern Indiana require certified operators. 
                Our training covers heavy-duty forklift operations and industrial safety requirements.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌽 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Indiana's agriculture includes corn, soybeans, and extensive food processing facilities. 
                Our certification covers agricultural forklift safety and food industry compliance requirements throughout Indiana.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Indiana Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Indianapolis forklift certification</li>
                <li>• Fort Wayne forklift training</li>
                <li>• Evansville forklift operators</li>
                <li>• South Bend forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Carmel warehouse training</li>
                <li>• Fishers distribution centers</li>
                <li>• Bloomington logistics facilities</li>
                <li>• Hammond steel operations</li>
              </ul>
              <ul className="space-y-1">
                <li>• Gary manufacturing sites</li>
                <li>• Lafayette operations</li>
                <li>• Muncie industrial facilities</li>
                <li>• Elkhart RV manufacturing</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR INDIANA */}
      {info.code === 'in' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Indiana-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Indiana automotive and RV manufacturing plants?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major Indiana automotive manufacturers 
              including Toyota, Honda, Subaru, and major RV manufacturers in Elkhart. The training meets automotive 
              and RV industry safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Indianapolis logistics companies and distribution centers require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Indiana's central location makes it a major distribution hub, and logistics companies like 
              Amazon, FedEx, and regional distributors require OSHA-compliant forklift certification. Our training 
              is accepted at major warehouses and distribution centers throughout Indiana.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Indiana's steel and heavy manufacturing industries?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in heavy industrial environments, 
              which is essential for Indiana's steel industry and heavy manufacturing sector. The certification 
              is valid for industrial operations throughout Indiana.
            </p>
          </details>
        </section>
      )}

      {/* WASHINGTON-SPECIFIC CONTENT */}
      {info.code === 'wa' && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Washington Forklift Training for Major Industries</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">💻 Technology & E-commerce</h3>
              <p className="text-sm text-gray-700">
                Washington is home to Amazon, Microsoft, and major tech companies with extensive warehouse and data center operations. 
                Our training covers e-commerce fulfillment, high-tech warehouse operations, and precision equipment handling.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">✈️ Aerospace & Manufacturing</h3>
              <p className="text-sm text-gray-700">
                Boeing and aerospace suppliers throughout Washington require certified forklift operators for aircraft component handling. 
                Our certification covers aerospace manufacturing environments and precision material handling requirements.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚢 Port & Maritime Operations</h3>
              <p className="text-sm text-gray-700">
                Seattle and Tacoma ports are major Pacific trade gateways handling container traffic and international freight. 
                Our training covers port logistics, container operations, and maritime material handling throughout Washington.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🌲 Agriculture & Food Processing</h3>
              <p className="text-sm text-gray-700">
                Washington's agriculture includes apples, cherries, wine production, and seafood processing. 
                Our certification covers agricultural forklift operations and food industry safety requirements throughout Washington.
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
            <h3 className="text-lg font-semibold mb-3">Washington Major Cities We Serve:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <ul className="space-y-1">
                <li>• Seattle forklift certification</li>
                <li>• Spokane forklift training</li>
                <li>• Tacoma forklift operators</li>
                <li>• Vancouver forklift certification</li>
              </ul>
              <ul className="space-y-1">
                <li>• Bellevue warehouse training</li>
                <li>• Kent distribution centers</li>
                <li>• Everett aerospace facilities</li>
                <li>• Renton manufacturing sites</li>
              </ul>
              <ul className="space-y-1">
                <li>• Yakima agricultural operations</li>
                <li>• Federal Way logistics hubs</li>
                <li>• Spokane Valley warehouses</li>
                <li>• Bellingham port operations</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR WASHINGTON */}
      {info.code === 'wa' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Washington-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Washington tech companies and Amazon facilities?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major Washington employers including 
              Amazon fulfillment centers, Microsoft facilities, and tech companies throughout the Seattle area. 
              The training meets e-commerce and high-tech warehouse safety standards.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Washington aerospace facilities and Boeing plants require forklift certification?
            </summary>
            <p className="mt-2">
              Yes! Washington's aerospace industry, including Boeing manufacturing facilities and suppliers 
              throughout Everett, Renton, and surrounding areas, require OSHA-compliant forklift certification. 
              Our training covers aerospace material handling and precision equipment operations.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is additional training needed for Washington's port operations and maritime logistics?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in port and maritime environments, 
              which is essential for Seattle and Tacoma port operations. The certification is valid for 
              container handling, intermodal freight, and maritime logistics throughout Washington.
            </p>
          </details>
        </section>
      )}

      {/* SCHEMA: BreadcrumbList + Course + FAQPage + AggregateRating */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://www.flatearthequipment.com",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Safety Training",
                    item: "https://www.flatearthequipment.com/safety",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "Forklift Certification",
                    item: "https://www.flatearthequipment.com/safety/forklift",
                  },
                  {
                    "@type": "ListItem",
                    position: 4,
                    name: info.name,
                    item: `https://www.flatearthequipment.com/safety/forklift/${info.code}`,
                  },
                ],
              },
              {
                "@type": "Course",
                name: "How to Get Forklift Certified in " + info.name + " - Online Training",
                description: "Learn how to get forklift certified in " + info.name + " with our OSHA-compliant online course. Complete certification in under 30 minutes.",
                provider: {
                  "@type": "Organization",
                  name: "Flat Earth Equipment",
                  logo: "https://www.flatearthequipment.com/logo.png",
                },
                offers: {
                  "@type": "Offer",
                  price: "49",
                  priceCurrency: "USD",
                  url: `https://www.flatearthequipment.com/safety/forklift/${info.code}`,
                },
                // NOTE: aggregateRating intentionally omitted. Per Google's
                // structured data policy, ratings must come from real
                // reviews of this specific course.
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: `Is this accepted in ${info.name}?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text:
                        "Yes. Our curriculum follows 29 CFR 1910.178(l) and is recognized nationwide, including " +
                        info.name +
                        ".",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How long is the forklift card valid?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Three years under OSHA guidelines.",
                    },
                  },
                  ...(info.code === 'ca' ? [
                    {
                      "@type": "Question",
                      name: "Is this OSHA approved or OSHA-compliant forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "OSHA does not approve private training companies. Employers need OSHA-compliant training under 29 CFR 1910.178(l): formal instruction plus workplace practical evaluation. Our online course provides formal instruction; your employer documents the hands-on evaluation.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Does this meet Cal/OSHA requirements for California?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. California enforces powered industrial truck rules through Cal/OSHA under a state plan that meets or exceeds federal OSHA. Our curriculum covers formal instruction paired with site-specific practical evaluation.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Can I get forklift certified online in Los Angeles, San Diego, or Sacramento?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes for the theory portion. Operators across Los Angeles, San Diego, Sacramento, and the rest of California complete online instruction, then finish the required practical evaluation at their workplace.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is forklift certification required at California ports and warehouses?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Employers at major California ports (LA, Long Beach, Oakland) and warehouse operations require trained, evaluated operators. Online theory speeds onboarding; the practical evaluation stays on site.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'il' ? [
                    {
                      "@type": "Question",
                      name: "How do I get forklift certified in Chicago online?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Complete OSHA-compliant online theory for $49, pass the exam, download your certificate, then have a qualified person at your Chicago workplace complete the hands-on practical evaluation.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Chicago warehouses and distribution centers?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes for the theory portion. Chicago logistics and warehouse employers still complete the required practical evaluation on your equipment under OSHA 29 CFR 1910.178(l).",
                      },
                    },
                  ] : []),
                  ...(info.code === 'pa' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Philadelphia port operations and warehouses?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Our OSHA-compliant certification is accepted by major employers throughout Pennsylvania, including port operations in Philadelphia, logistics companies, and warehouse facilities across the state's major industrial corridors.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Pennsylvania steel mills and manufacturing plants require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely. Pennsylvania's manufacturing sector, including steel mills in Pittsburgh, chemical plants, and machinery manufacturers throughout the state, require OSHA-compliant forklift certification.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for Pennsylvania's energy sector operations?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in industrial settings, including Pennsylvania's energy sector. The certification is valid for natural gas facilities, coal operations, and renewable energy projects throughout Pennsylvania.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'oh' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Ohio automotive plants and manufacturing facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major Ohio automotive manufacturers including Honda, Ford, GM, and their suppliers throughout Ohio. The training meets automotive industry safety standards and lean manufacturing requirements.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Ohio distribution centers and logistics companies require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Ohio's strategic location makes it a major distribution hub, and logistics companies like Amazon, FedEx, UPS, and DHL require certified forklift operators. Our certification is accepted at major distribution centers throughout Ohio.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for Ohio's energy and chemical processing industries?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in industrial environments, including Ohio's energy and chemical sectors. The certification is valid for coal operations, natural gas facilities, and chemical processing plants throughout Ohio.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'ga' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at the Port of Savannah and Atlanta distribution centers?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Georgia, including port operations in Savannah, logistics companies in Atlanta's distribution corridor, and warehouse facilities across Georgia's major transportation hubs.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Georgia manufacturing and aerospace facilities require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Georgia's manufacturing sector, including automotive plants, aerospace facilities like those in Warner Robins, and defense contractors throughout the state, require OSHA-compliant forklift certification. Our training meets aerospace and automotive industry safety standards.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for Georgia's food processing and agricultural operations?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in food processing and agricultural settings, which is essential for Georgia's significant agriculture and food industry. The certification is valid for poultry operations, food processing plants, and agricultural facilities throughout Georgia.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'nc' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Charlotte financial institutions and Research Triangle tech companies?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout North Carolina, including financial institutions in Charlotte, tech companies in the Research Triangle, and corporate facilities across the state's major business centers.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do North Carolina manufacturing and defense facilities require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! North Carolina's manufacturing sector, including furniture makers, textile companies, automotive suppliers, and defense contractors serving military installations, require OSHA-compliant forklift certification. Our training meets defense industry and advanced manufacturing safety standards.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for North Carolina's pharmaceutical and biotech operations?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in controlled environments, which is important for North Carolina's significant pharmaceutical and biotech industries in the Research Triangle. The certification is valid for clean room logistics and high-tech manufacturing throughout North Carolina.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'mi' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Michigan automotive plants and assembly facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major Michigan automotive manufacturers including Ford, GM, Chrysler, and their tier-one suppliers throughout Michigan. The training meets automotive industry safety standards and lean manufacturing requirements.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Michigan manufacturing and steel processing facilities require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Michigan's heavy manufacturing sector, including steel processing, machinery manufacturers, and chemical plants throughout the state, require OSHA-compliant forklift certification. Our training covers heavy industrial safety requirements common in Michigan's manufacturing base.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for Michigan's Great Lakes shipping and port operations?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in shipping and logistics environments, which is essential for Michigan's Great Lakes ports and shipping operations. The certification is valid for port operations, intermodal freight handling, and logistics centers throughout Michigan.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'va' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Virginia military installations and defense contractors?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Virginia, including defense contractors serving Norfolk Naval Base, Pentagon operations, Quantico, and other military installations. The training meets defense industry security and safety standards.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Virginia port operations and shipbuilding facilities require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Virginia's port operations, including the Port of Virginia and Newport News Shipbuilding, require OSHA-compliant forklift certification. Our training covers maritime logistics, container handling, and shipyard safety requirements specific to Virginia's maritime industry.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is additional training needed for Virginia's federal contracting and government facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our comprehensive OSHA training covers forklift operations in government and federal contracting environments, which is essential for Northern Virginia's extensive federal contractor base. The certification meets government facility requirements and federal contractor standards throughout Virginia.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'ny' ? [
                    {
                      "@type": "Question",
                      name: "Can I get forklift certified online in New York City?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes for the theory portion. NYC operators complete online OSHA instruction for $49, then finish the required practical evaluation with a qualified person at their workplace.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is online forklift certification valid in Buffalo and Rochester?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes statewide for formal instruction when paired with a workplace practical evaluation under OSHA 29 CFR 1910.178(l).",
                      },
                    },
                  ] : []),
                  ...(info.code === 'tx' ? [
                    {
                      "@type": "Question",
                      name: "How do I get forklift certified in Texas online?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Complete OSHA-compliant online theory for $49, pass the exam, download your certificate, then have a qualified person at your Texas workplace complete the hands-on practical evaluation.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is online forklift certification accepted in Houston and Dallas–Fort Worth?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes for the classroom/theory portion. Houston and DFW employers still complete the required practical evaluation on your equipment.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Houston energy facilities and petrochemical plants?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our OSHA-compliant formal instruction is used by Texas employers across logistics and industrial sites, including energy-corridor workplaces. Site-specific practical evaluation sits with your employer.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'fl' ? [
                    {
                      "@type": "Question",
                      name: "Can I get forklift certified online in Miami?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes for the theory portion. Miami operators complete online OSHA instruction for $49, then finish the required practical evaluation at their workplace.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is online forklift certification accepted in Jacksonville and Tampa?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes statewide for formal instruction when paired with a workplace practical evaluation under OSHA 29 CFR 1910.178(l).",
                      },
                    },
                  ] : []),
                  ...(info.code === 'az' ? [
                    {
                      "@type": "Question",
                      name: "How do I get forklift certified in Phoenix online?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Complete OSHA-compliant online theory for $49, pass the exam, download your certificate, then have a qualified person at your Phoenix workplace complete the hands-on practical evaluation.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Phoenix distribution centers and logistics facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes for the theory portion. Phoenix metro employers still complete the required practical evaluation on your equipment under OSHA 29 CFR 1910.178(l).",
                      },
                    },
                  ] : []),
                  ...(info.code === 'tn' ? [
                    {
                      "@type": "Question",
                      name: "How do I get a forklift license in Memphis, TN?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "There is no DMV forklift license. Complete OSHA-compliant online theory for $49, pass the exam, download your certificate, then have a qualified person at your Memphis workplace complete the hands-on practical evaluation.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Tennessee automotive plants and manufacturing facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Our OSHA-compliant formal instruction is used by Tennessee automotive and manufacturing employers. Site-specific practical evaluation sits with your employer.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'nj' ? [
                    {
                      "@type": "Question",
                      name: "How do I get forklift certification in NJ?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Complete OSHA-compliant online theory for $49, pass the exam, download your certificate, then have a qualified person at your New Jersey workplace complete the hands-on practical evaluation.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Can I get forklift certified online in Newark or Jersey City?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes for the theory portion. Newark, Jersey City, Elizabeth, and other NJ operators finish online instruction, then complete the required practical evaluation on site.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'wi' ? [
                    {
                      "@type": "Question",
                      name: "Where can I get forklift training in Milwaukee online?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Complete OSHA-compliant online theory for $49, pass the exam, then have a qualified person at your Milwaukee workplace complete the hands-on practical evaluation.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is online forklift certification valid across Wisconsin?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes for the theory portion statewide—including Madison, Green Bay, and Appleton—when paired with a workplace practical evaluation under OSHA 29 CFR 1910.178(l).",
                      },
                    },
                  ] : []),
                  ...(info.code === 'in' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Indiana automotive and RV manufacturing plants?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major Indiana automotive manufacturers including Toyota, Honda, Subaru, and major RV manufacturers in Elkhart.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'wa' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Washington tech companies and Amazon facilities?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major Washington employers including Amazon fulfillment centers, Microsoft facilities, and tech companies throughout the Seattle area.",
                      },
                    },
                  ] : []),
                ],
              },
            ],
          }),
        }}
      />

    </main>
    
    {/* Mobile Sticky CTA */}
    <StickyCTA />
  </>
  );
} 