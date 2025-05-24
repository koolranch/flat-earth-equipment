import Link from 'next/link'

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

// Generate static params for all 50 states
export async function generateStaticParams() {
  return Object.keys(OSHA_FINES_BY_STATE).map((state) => ({
    state: state,
  }))
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

interface PageProps {
  params: {
    state: string
  }
}

export default function StateForkliftCertificationPage({ params }: PageProps) {
  const stateData = OSHA_FINES_BY_STATE[params.state]
  
  if (!stateData) {
    return <div>State not found</div>
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Breadcrumb stateName={stateData.stateName} />
      
      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        How to Get Forklift Certified in {stateData.stateName}
      </h1>
      
      <div className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          OSHA Fines in {stateData.stateName}
        </h2>
        <p className="text-gray-700 mb-2">
          <strong>Serious Violations:</strong> Up to ${stateData.serious.toLocaleString()} per violation
        </p>
        <p className="text-gray-700">
          <strong>Willful Violations:</strong> Up to ${stateData.willful.toLocaleString()} per violation
        </p>
      </div>

      <section className="prose prose-lg max-w-none mb-12">
        <p>
          Getting forklift certified in {stateData.stateName} is essential for workplace safety and OSHA compliance. 
          Employers in {stateData.stateName} are required to ensure all forklift operators receive proper training 
          before operating powered industrial trucks.
        </p>
        
        <h2>OSHA Requirements in {stateData.stateName}</h2>
        <p>
          The Occupational Safety and Health Administration (OSHA) mandates that all forklift operators must be 
          certified under 29 CFR 1910.178. This applies to all employers in {stateData.stateName}, regardless of 
          company size or industry.
        </p>
        
        <h2>Steps to Get Certified</h2>
        <ol>
          <li>Complete online theory training covering OSHA regulations and safety procedures</li>
          <li>Pass the knowledge assessment with at least 80% accuracy</li>
          <li>Have your employer conduct a practical evaluation of your operating skills</li>
          <li>Receive your certification documentation</li>
        </ol>
        
        <h2>Why Choose Our Training?</h2>
        <ul>
          <li>100% OSHA-compliant curriculum</li>
          <li>Available 24/7 from any device</li>
          <li>Instant certificate upon completion</li>
          <li>Employer evaluation checklist included</li>
          <li>Valid for 3 years per OSHA guidelines</li>
        </ul>
      </section>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-semibold mb-4">Ready to Get Certified?</h3>
        <p className="text-gray-700 mb-6">
          Join thousands of operators in {stateData.stateName} who have completed our OSHA-compliant training.
        </p>
        <Link 
          href="/safety" 
          className="inline-block bg-safety hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Start Your Certification
        </Link>
        <p className="text-sm text-gray-600 mt-4">
          Only $59 • Complete in under 2 hours • Certificate issued immediately
        </p>
      </div>
    </main>
  )
} 