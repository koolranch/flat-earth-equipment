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
    title: `How to Get Forklift Certified in ${state.name} | Online OSHA Training`,
    description: `Learn how to get forklift certified in ${state.name}. Complete OSHA-compliant certification online in under 60 minutes. Instant certificate download for ${state.name} operators.`,
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
          How to Get Forklift Certified in {info.name} (Online)
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600">
          Getting forklift certified in {info.name} is simple with our OSHA CFR 1910.178-compliant online course.
          Complete your {info.name} forklift certification in under 60 minutes and download your wallet card instantly.
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

      {/* HOW TO GET CERTIFIED SECTION */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">How to Get Forklift Certified in {info.name}</h2>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Simple 3-Step Process:</h3>
          <ol className="list-decimal pl-6 space-y-3 text-gray-700">
            <li><strong>Enroll Online:</strong> Register for our OSHA-compliant forklift certification course from anywhere in {info.name}.</li>
            <li><strong>Complete Training:</strong> Finish the online course in under 60 minutes at your own pace.</li>
            <li><strong>Get Certified:</strong> Pass the 30-question exam and instantly download your printable certificate and wallet card.</li>
          </ol>
        </div>
        <h3 className="text-xl font-semibold">Why Choose Our {info.name} Forklift Certification?</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>100% online—train anywhere in {info.name}.</li>
          <li>Instant printable certificate & wallet card.</li>
          <li>Free retakes until you pass (30-question exam).</li>
          <li>Bulk pricing for teams statewide.</li>
          <li>OSHA CFR 1910.178(l) compliant training.</li>
          <li>Valid for 3 years throughout {info.name}.</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Frequently Asked Questions - Forklift Certification in {info.name}</h2>
        <details className="rounded-lg bg-neutral-50 p-4">
          <summary className="cursor-pointer font-medium">
            How do I get forklift certified in {info.name}?
          </summary>
          <p className="mt-2">
            To get forklift certified in {info.name}, simply enroll in our online OSHA-compliant course, complete the training in under 60 minutes, 
            and pass the exam. You'll instantly receive your printable certification valid throughout {info.name}.
          </p>
        </details>
        <details className="rounded-lg bg-neutral-50 p-4">
          <summary className="cursor-pointer font-medium">
            Is this forklift certification accepted by OSHA inspectors in {info.name}?
          </summary>
          <p className="mt-2">
            Yes. Our curriculum follows 29 CFR 1910.178(l), recognized nationwide and accepted by OSHA inspectors in {info.name}.
            Be sure your operators complete hands-on evaluation per OSHA rules.
          </p>
        </details>
        <details className="rounded-lg bg-neutral-50 p-4">
          <summary className="cursor-pointer font-medium">How long does it take to get forklift certified in {info.name}?</summary>
          <p className="mt-2">
            You can get forklift certified in {info.name} in under 60 minutes with our online course. 
            The training is self-paced, so you can complete it faster if needed.
          </p>
        </details>
        <details className="rounded-lg bg-neutral-50 p-4">
          <summary className="cursor-pointer font-medium">How long is my {info.name} forklift certification valid?</summary>
          <p className="mt-2">
            Your {info.name} forklift certification is valid for three years, or sooner if the operator is involved in an accident or switches truck type.
          </p>
        </details>
        <details className="rounded-lg bg-neutral-50 p-4">
          <summary className="cursor-pointer font-medium">
            What are the requirements to get forklift certified in {info.name}?
          </summary>
          <p className="mt-2">
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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm">
            <strong>Important:</strong> After completing our online course, you must also receive hands-on training and 
            evaluation from a qualified person at your workplace to be fully compliant with OSHA standards in {info.name}.
          </p>
        </div>
      </section>

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
                <li>• Los Angeles forklift certification</li>
                <li>• San Francisco forklift training</li>
                <li>• San Diego forklift operators</li>
                <li>• Sacramento forklift certification</li>
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
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR CALIFORNIA */}
      {info.code === 'ca' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">California-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Does this meet Cal/OSHA requirements for California?
            </summary>
            <p className="mt-2">
              Yes! Our training meets both federal OSHA and Cal/OSHA requirements. California operates under its own 
              state plan with standards that meet or exceed federal requirements. Our curriculum covers all necessary 
              safety protocols for California workplaces.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is forklift certification required at California ports and warehouses?
            </summary>
            <p className="mt-2">
              Absolutely. Major California ports (LA, Long Beach, Oakland) and warehouse operations require certified 
              forklift operators. Many employers prefer online certification for faster onboarding of new workers 
              in California's fast-paced logistics industry.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do I need additional training for agricultural forklift work in California?
            </summary>
            <p className="mt-2">
              Our OSHA-compliant training covers the fundamentals for all industries, including agriculture. However, 
              some California agricultural employers may require additional site-specific training for handling 
              agricultural products and working in outdoor conditions.
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
                <li>• Chicago forklift certification</li>
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
          </div>
        </section>
      )}

      {/* ADDITIONAL FAQ FOR ILLINOIS */}
      {info.code === 'il' && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Illinois-Specific Forklift Training Questions</h2>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is this certification accepted at Chicago warehouses and distribution centers?
            </summary>
            <p className="mt-2">
              Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Illinois, 
              including Amazon, Walmart, UPS, FedEx, and other logistics companies operating in the Chicago area 
              and throughout Illinois.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Do Illinois manufacturing plants require forklift certification?
            </summary>
            <p className="mt-2">
              Yes, Illinois manufacturing facilities, including automotive plants, steel mills, and machinery manufacturers, 
              require OSHA-compliant forklift certification. Our training covers the safety requirements for 
              heavy industrial environments common in Illinois.
            </p>
          </details>
          <details className="rounded-lg bg-neutral-50 p-4">
            <summary className="cursor-pointer font-medium">
              Is special training needed for Illinois agricultural operations?
            </summary>
            <p className="mt-2">
              Our comprehensive OSHA training covers forklift operations in agricultural settings, which is important 
              for Illinois' significant farming and food processing industries. The certification is valid for 
              agricultural applications throughout Illinois.
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

      {/* SCHEMA: Course + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Course",
                name: "How to Get Forklift Certified in " + info.name + " - Online Training",
                description: "Learn how to get forklift certified in " + info.name + " with our OSHA-compliant online course. Complete certification in under 60 minutes.",
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
                  ...(info.code === 'ca' ? [
                    {
                      "@type": "Question",
                      name: "Does this meet Cal/OSHA requirements for California?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Our training meets both federal OSHA and Cal/OSHA requirements. California operates under its own state plan with standards that meet or exceed federal requirements.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is forklift certification required at California ports and warehouses?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely. Major California ports (LA, Long Beach, Oakland) and warehouse operations require certified forklift operators for faster onboarding in California's logistics industry.",
                      },
                    },
                  ] : []),
                  ...(info.code === 'il' ? [
                    {
                      "@type": "Question",
                      name: "Is this certification accepted at Chicago warehouses and distribution centers?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Absolutely! Our OSHA-compliant certification is accepted by major employers throughout Illinois, including Amazon, Walmart, UPS, FedEx, and other logistics companies.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do Illinois manufacturing plants require forklift certification?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, Illinois manufacturing facilities, including automotive plants, steel mills, and machinery manufacturers, require OSHA-compliant forklift certification.",
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