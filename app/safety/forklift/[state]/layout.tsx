import { Metadata } from 'next'

const STATE_NAMES: { [key: string]: string } = {
  'al': 'Alabama', 'ak': 'Alaska', 'az': 'Arizona', 'ar': 'Arkansas', 'ca': 'California',
  'co': 'Colorado', 'ct': 'Connecticut', 'de': 'Delaware', 'fl': 'Florida', 'ga': 'Georgia',
  'hi': 'Hawaii', 'id': 'Idaho', 'il': 'Illinois', 'in': 'Indiana', 'ia': 'Iowa',
  'ks': 'Kansas', 'ky': 'Kentucky', 'la': 'Louisiana', 'me': 'Maine', 'md': 'Maryland',
  'ma': 'Massachusetts', 'mi': 'Michigan', 'mn': 'Minnesota', 'ms': 'Mississippi', 'mo': 'Missouri',
  'mt': 'Montana', 'ne': 'Nebraska', 'nv': 'Nevada', 'nh': 'New Hampshire', 'nj': 'New Jersey',
  'nm': 'New Mexico', 'ny': 'New York', 'nc': 'North Carolina', 'nd': 'North Dakota', 'oh': 'Ohio',
  'ok': 'Oklahoma', 'or': 'Oregon', 'pa': 'Pennsylvania', 'ri': 'Rhode Island', 'sc': 'South Carolina',
  'sd': 'South Dakota', 'tn': 'Tennessee', 'tx': 'Texas', 'ut': 'Utah', 'vt': 'Vermont',
  'va': 'Virginia', 'wa': 'Washington', 'wv': 'West Virginia', 'wi': 'Wisconsin', 'wy': 'Wyoming'
}

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const stateName = STATE_NAMES[params.state] || 'Unknown State'
  
  return {
    title: `Online Forklift Certification in ${stateName} | OSHA Compliant Training`,
    description: `Get OSHA-compliant forklift certification in ${stateName}. 100% online training available 24/7. Complete in under 30 minutes. Only $49 with instant certificate download.`,
    openGraph: {
      title: `Forklift Certification in ${stateName} | OSHA Compliant Training`,
      description: `Get OSHA-compliant forklift certification in ${stateName}. Online training available 24/7.`,
      url: `https://www.flatearthequipment.com/safety/forklift/${params.state}`,
    },
  }
}

export default function StateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 