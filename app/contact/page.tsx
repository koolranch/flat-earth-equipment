import { Metadata } from 'next';
import { generatePageAlternates } from '@/app/seo-defaults';

export const metadata: Metadata = {
  title: 'Contact Flat Earth Equipment | Sheridan, WY',
  description: 'Contact Flat Earth Equipment for forklift parts, training support, and equipment inquiries. Call 888-392-9175 or visit our Sheridan, WY location.',
  alternates: generatePageAlternates('/contact'),
  openGraph: {
    title: 'Contact Flat Earth Equipment',
    description: 'Get in touch with our team for parts, training, and equipment support.',
    type: 'website',
  },
};

// LocalBusiness + Organization JSON-LD Schema
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.flatearthequipment.com/#organization',
      name: 'Flat Earth Equipment',
      url: 'https://www.flatearthequipment.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.flatearthequipment.com/logo.png',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-888-392-9175',
        contactType: 'customer service',
        areaServed: 'US',
        availableLanguage: ['English', 'Spanish'],
      },
      sameAs: [
        'https://www.flatearthequipment.com/contact',
      ],
    },
    {
      '@type': 'LocalBusiness',
      '@id': 'https://www.flatearthequipment.com/#localbusiness',
      name: 'Flat Earth Equipment',
      description: 'Industrial forklift parts, training certification, and equipment services.',
      url: 'https://www.flatearthequipment.com',
      telephone: '+1-888-392-9175',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '30 N Gould St, STE R',
        addressLocality: 'Sheridan',
        addressRegion: 'WY',
        postalCode: '82801',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 44.7972,
        longitude: -106.9561,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '17:00',
        },
      ],
      parentOrganization: {
        '@id': 'https://www.flatearthequipment.com/#organization',
      },
    },
  ],
};

export default function Contact() {
  return (
    <>
      {/* JSON-LD Schema for E-E-A-T */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 prose prose-slate max-w-none">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Contact Us</h1>
            <p className="text-lg text-slate-600 mb-8">
              Need help with enrollment, records, billing, or parts inquiries? We're here to help.
            </p>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Support Channels</h2>
            <ul className="space-y-3 list-none pl-0">
              <li className="flex items-start gap-3">
                <span className="text-amber-600 mt-1">📧</span>
                <div>
                  <strong className="text-slate-800">Email:</strong>{' '}
                  <a href="mailto:contact@flatearthequipment.com" className="text-amber-600 hover:text-amber-700">
                    contact@flatearthequipment.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 mt-1">🎓</span>
                <div>
                  <strong className="text-slate-800">Training Issues:</strong>{' '}
                  <span className="text-slate-600">Include your enrollment ID or certificate verification code</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 mt-1">🔧</span>
                <div>
                  <strong className="text-slate-800">Technical Problems:</strong>{' '}
                  <span className="text-slate-600">Describe what you were doing when the issue occurred</span>
                </div>
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Business Hours</h2>
            <p className="text-slate-600">
              Monday – Friday: 8:00 AM – 5:00 PM (Mountain Time)<br />
              We typically respond within 24 hours during business days.
            </p>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Training Support</h2>
            <p className="text-slate-600">
              For immediate help with course content, check the help sections within each module or contact your trainer directly if you're in a company program.
            </p>

            {/* Google Maps Embed - Lazy Loaded */}
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Our Location</h2>
            <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2838.5!2d-106.9561!3d44.7972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5335fa9a1f7e6c5d%3A0x1234567890abcdef!2s30%20N%20Gould%20St%2C%20Sheridan%2C%20WY%2082801!5e0!3m2!1sen!2sus!4v1704067200000"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Flat Earth Equipment - Sheridan, WY Office Location"
                className="w-full"
              />
            </div>
          </div>

          {/* Sidebar - Business Details */}
          <div className="lg:col-span-1">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Details</h2>
              
              {/* Phone - Clickable for mobile */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Phone</p>
                <a 
                  href="tel:+18883929175" 
                  className="text-2xl font-bold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  888-392-9175
                </a>
                <p className="text-xs text-slate-500 mt-1">Toll-free, US only</p>
              </div>

              {/* Address */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Address</p>
                <address className="text-slate-700 not-italic leading-relaxed">
                  30 N Gould St, STE R<br />
                  Sheridan, WY 82801<br />
                  United States
                </address>
              </div>

              {/* Email */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Email</p>
                <a 
                  href="mailto:contact@flatearthequipment.com" 
                  className="text-amber-600 hover:text-amber-700 transition-colors break-all"
                >
                  contact@flatearthequipment.com
                </a>
              </div>

              {/* Quick Actions */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Quick Links</p>
                <div className="space-y-2">
                  <a 
                    href="/quote" 
                    className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Request a Quote
                  </a>
                  <a 
                    href="/parts" 
                    className="block w-full text-center bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Browse Parts
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
