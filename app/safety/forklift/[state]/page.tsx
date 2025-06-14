import { Metadata } from "next";
import { notFound } from "next/navigation";
import { forkliftStates, ForkliftStateInfo } from "../../../../src/data/forkliftStates";
import CheckoutButton from "@/app/safety/CheckoutButton";
import Link from "next/link";

// Disable dynamic params to ensure only pre-generated pages are served
export const dynamicParams = false

// OSHA fine mapping by state (sample data - you can update with real values)
const OSHA_FINES_BY_STATE: { [key: string]: { serious: number, willful: number, stateName: string } } = {
  'al': { serious: 15625, willful: 156259, stateName: 'Alabama' },
  'ak': { serious: 15625, willful: 156259, stateName: 'Alaska' },
  'az': { serious: 15625, willful: 156259, stateName: 'Arizona' },
  'ar': { serious: 15625, willful: 156259, stateName: 'Arkansas' },
  'ca': { serious: 18000, willful: 180000, stateName: 'California' }, // CA has higher fines
  'co': { serious: 15625, willful: 156259, stateName: 'Colorado' },
  'ct': { serious: 15625, willful: 156259, stateName: 'Connecticut' },
  'de': { serious: 15625, willful: 156259, stateName: 'Delaware' },
  'fl': { serious: 15625, willful: 156259, stateName: 'Florida' },
  'ga': { serious: 15625, willful: 156259, stateName: 'Georgia' },
  'hi': { serious: 15625, willful: 156259, stateName: 'Hawaii' },
  'id': { serious: 15625, willful: 156259, stateName: 'Idaho' },
  'il': { serious: 15625, willful: 156259, stateName: 'Illinois' },
  'in': { serious: 15625, willful: 156259, stateName: 'Indiana' },
  'ia': { serious: 15625, willful: 156259, stateName: 'Iowa' },
  'ks': { serious: 15625, willful: 156259, stateName: 'Kansas' },
  'ky': { serious: 15625, willful: 156259, stateName: 'Kentucky' },
  'la': { serious: 15625, willful: 156259, stateName: 'Louisiana' },
  'me': { serious: 15625, willful: 156259, stateName: 'Maine' },
  'md': { serious: 15625, willful: 156259, stateName: 'Maryland' },
  'ma': { serious: 15625, willful: 156259, stateName: 'Massachusetts' },
  'mi': { serious: 17000, willful: 170000, stateName: 'Michigan' }, // MI has state plan
  'mn': { serious: 15625, willful: 156259, stateName: 'Minnesota' },
  'ms': { serious: 15625, willful: 156259, stateName: 'Mississippi' },
  'mo': { serious: 15625, willful: 156259, stateName: 'Missouri' },
  'mt': { serious: 15625, willful: 156259, stateName: 'Montana' },
  'ne': { serious: 15625, willful: 156259, stateName: 'Nebraska' },
  'nv': { serious: 15625, willful: 156259, stateName: 'Nevada' },
  'nh': { serious: 15625, willful: 156259, stateName: 'New Hampshire' },
  'nj': { serious: 15625, willful: 156259, stateName: 'New Jersey' },
  'nm': { serious: 15625, willful: 156259, stateName: 'New Mexico' },
  'ny': { serious: 15625, willful: 156259, stateName: 'New York' },
  'nc': { serious: 15625, willful: 156259, stateName: 'North Carolina' },
  'nd': { serious: 15625, willful: 156259, stateName: 'North Dakota' },
  'oh': { serious: 15625, willful: 156259, stateName: 'Ohio' },
  'ok': { serious: 15625, willful: 156259, stateName: 'Oklahoma' },
  'or': { serious: 16000, willful: 160000, stateName: 'Oregon' }, // OR has state plan
  'pa': { serious: 15625, willful: 156259, stateName: 'Pennsylvania' },
  'ri': { serious: 15625, willful: 156259, stateName: 'Rhode Island' },
  'sc': { serious: 15625, willful: 156259, stateName: 'South Carolina' },
  'sd': { serious: 15625, willful: 156259, stateName: 'South Dakota' },
  'tn': { serious: 15625, willful: 156259, stateName: 'Tennessee' },
  'tx': { serious: 15625, willful: 156259, stateName: 'Texas' },
  'ut': { serious: 15625, willful: 156259, stateName: 'Utah' },
  'vt': { serious: 15625, willful: 156259, stateName: 'Vermont' },
  'va': { serious: 15625, willful: 156259, stateName: 'Virginia' },
  'wa': { serious: 16000, willful: 160000, stateName: 'Washington' }, // WA has state plan
  'wv': { serious: 15625, willful: 156259, stateName: 'West Virginia' },
  'wi': { serious: 15625, willful: 156259, stateName: 'Wisconsin' },
  'wy': { serious: 15625, willful: 156259, stateName: 'Wyoming' }
}

type Props = { params: { state: string } };

export async function generateStaticParams() {
  return forkliftStates.map((s: ForkliftStateInfo) => ({ state: s.code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const state = forkliftStates.find((s: ForkliftStateInfo) => s.code === params.state) ?? notFound();
  return {
    title: `${state.name} Online Forklift Certification | OSHA Approved`,
    description: `Get OSHA-compliant forklift operator training in ${state.name}. 100% online – earn your card today.`,
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
      <Link href="/safety" className="hover:text-safety transition-colors">
        Forklift
      </Link>
      <span>/</span>
      <span className="text-gray-900">{stateName}</span>
    </nav>
  )
}

export default function StateForkliftPage({ params }: Props) {
  const info = forkliftStates.find((s: ForkliftStateInfo) => s.code === params.state) ?? notFound();

  return (
    <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
      <Breadcrumb stateName={info.name} />
      {/* HERO */}
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold">
          {info.name} Forklift Operator Certification (Online)
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600">
          Train the Western-tough way—OSHA CFR 1910.178-compliant, recognized in {info.name}.
          Finish in under 90 minutes and download your wallet card instantly.
        </p>
        <CheckoutButton 
          courseSlug="forklift"
          price="59"
          priceId="price_1RS834HJI548rO8JpJMyGhL3"
        />
      </section>

      {/* FINES TABLE */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">OSHA Penalties in {info.name}</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Violation Type</th>
              <th className="py-2">Possible Fine</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Serious / Other-Than-Serious</td>
              <td className="py-2">
                ${info.fines.min.toLocaleString()} – ${info.fines.max.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td className="py-2">Willful / Repeat</td>
              <td className="py-2">Up to ${info.fines.max.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-500">
          {info.hasStatePlan
            ? `${info.name} operates its own OSHA-approved State Plan; fines may differ from federal maximums.`
            : `${info.name} is regulated directly by Federal OSHA.`}
        </p>
      </section>

      {/* COURSE BENEFITS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Why Choose Flat Earth Equipment?</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>100% online—train anywhere in {info.name}.</li>
          <li>Instant printable certificate & wallet card.</li>
          <li>Free retakes until you pass (30-question exam).</li>
          <li>Bulk pricing for teams statewide.</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">FAQs – {info.name}</h2>
        <details className="rounded-lg bg-neutral-50 p-4">
          <summary className="cursor-pointer font-medium">
            Is this accepted by OSHA inspectors in {info.name}?
          </summary>
          <p className="mt-2">
            Yes. Our curriculum follows 29 CFR 1910.178(l), recognized nationwide.
            Be sure your operators complete hands-on evaluation per OSHA rules.
          </p>
        </details>
        <details className="rounded-lg bg-neutral-50 p-4">
          <summary className="cursor-pointer font-medium">How long is the card valid?</summary>
          <p className="mt-2">Three years, or sooner if the operator is involved in an accident or switches truck type.</p>
        </details>
      </section>

      {/* SCHEMA: Course + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Course",
                name: "Online Forklift Operator Certification",
                description: "OSHA-compliant forklift training accepted in " + info.name,
                provider: {
                  "@type": "Organization",
                  name: "Flat Earth Equipment",
                  logo: "https://www.flatearthequipment.com/logo.png",
                },
                offers: {
                  "@type": "Offer",
                  price: "59",
                  priceCurrency: "USD",
                  url: `https://www.flatearthequipment.com/safety/forklift/${info.code}`,
                },
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
                ],
              },
            ],
          }),
        }}
      />

      {/* META tags */}
      <meta name="robots" content="index,follow" />
      <link
        rel="canonical"
        href={`https://www.flatearthequipment.com/safety/forklift/${info.code}`}
      />
    </main>
  );
} 