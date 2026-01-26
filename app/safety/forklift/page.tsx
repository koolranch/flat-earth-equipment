import Link from 'next/link'

const STATES = [
  { code: 'al', name: 'Alabama' },
  { code: 'ak', name: 'Alaska' },
  { code: 'az', name: 'Arizona' },
  { code: 'ar', name: 'Arkansas' },
  { code: 'ca', name: 'California' },
  { code: 'co', name: 'Colorado' },
  { code: 'ct', name: 'Connecticut' },
  { code: 'de', name: 'Delaware' },
  { code: 'fl', name: 'Florida' },
  { code: 'ga', name: 'Georgia' },
  { code: 'hi', name: 'Hawaii' },
  { code: 'id', name: 'Idaho' },
  { code: 'il', name: 'Illinois' },
  { code: 'in', name: 'Indiana' },
  { code: 'ia', name: 'Iowa' },
  { code: 'ks', name: 'Kansas' },
  { code: 'ky', name: 'Kentucky' },
  { code: 'la', name: 'Louisiana' },
  { code: 'me', name: 'Maine' },
  { code: 'md', name: 'Maryland' },
  { code: 'ma', name: 'Massachusetts' },
  { code: 'mi', name: 'Michigan' },
  { code: 'mn', name: 'Minnesota' },
  { code: 'ms', name: 'Mississippi' },
  { code: 'mo', name: 'Missouri' },
  { code: 'mt', name: 'Montana' },
  { code: 'ne', name: 'Nebraska' },
  { code: 'nv', name: 'Nevada' },
  { code: 'nh', name: 'New Hampshire' },
  { code: 'nj', name: 'New Jersey' },
  { code: 'nm', name: 'New Mexico' },
  { code: 'ny', name: 'New York' },
  { code: 'nc', name: 'North Carolina' },
  { code: 'nd', name: 'North Dakota' },
  { code: 'oh', name: 'Ohio' },
  { code: 'ok', name: 'Oklahoma' },
  { code: 'or', name: 'Oregon' },
  { code: 'pa', name: 'Pennsylvania' },
  { code: 'ri', name: 'Rhode Island' },
  { code: 'sc', name: 'South Carolina' },
  { code: 'sd', name: 'South Dakota' },
  { code: 'tn', name: 'Tennessee' },
  { code: 'tx', name: 'Texas' },
  { code: 'ut', name: 'Utah' },
  { code: 'vt', name: 'Vermont' },
  { code: 'va', name: 'Virginia' },
  { code: 'wa', name: 'Washington' },
  { code: 'wv', name: 'West Virginia' },
  { code: 'wi', name: 'Wisconsin' },
  { code: 'wy', name: 'Wyoming' }
]

export const metadata = {
  title: 'Forklift Certification by State | OSHA Training',
  description: 'Find OSHA forklift certification by state. Compliant training for all 50 states with instant certificates and state-specific requirements covered.',
  alternates: {
    canonical: 'https://www.flatearthequipment.com/safety/forklift'
  },
  openGraph: {
    title: 'Forklift Certification by State | OSHA Training',
    description: 'Get OSHA-compliant forklift certification in any US state. Select your state to learn about requirements and OSHA fines.',
    url: 'https://www.flatearthequipment.com/safety/forklift',
    type: 'website',
    siteName: 'Flat Earth Equipment'
  }
}

export default function ForkliftStatesPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-safety transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/safety" className="hover:text-safety transition-colors">
          Safety Training
        </Link>
        <span>/</span>
        <span className="text-gray-900">Forklift Certification by State</span>
      </nav>

      <h1 className="text-4xl font-bold mb-4 text-gray-900">
        Forklift Certification by State
      </h1>
      
      <p className="text-lg text-gray-700 mb-8">
        Select your state below to learn about OSHA requirements, potential fines, and how to get certified.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {STATES.map((state) => (
          <Link
            key={state.code}
            href={`/safety/forklift/${state.code}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-safety hover:bg-orange-50 transition-colors text-center"
          >
            <span className="font-medium text-gray-900">{state.name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-700 mb-6">
          Our OSHA-compliant training works in all 50 states. Get certified today!
        </p>
        <Link 
          href="/safety" 
          className="inline-block bg-safety hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Start Your Certification
        </Link>
      </div>
    </main>
  )
} 