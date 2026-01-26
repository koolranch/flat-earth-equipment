import { Metadata } from 'next';
import Link from 'next/link';
import { generatePageAlternates } from '@/app/seo-defaults';
import EnhancedContactForm from './EnhancedContactForm';

export const metadata: Metadata = {
  title: 'Contact Flat Earth Equipment | Parts & Training',
  description: 'Contact Flat Earth Equipment for forklift parts, rentals, and OSHA training. Expert technical support, fast shipping, and professional service nationwide.',
  alternates: generatePageAlternates('/contact'),
  keywords: ['equipment rental', 'forklift service', 'operator training', 'OSHA certification', 'telehandler rental', 'boom lift rental'],
  openGraph: {
    title: 'Contact Flat Earth Equipment | Rentals, Service & Training',
    description: 'Equipment rentals, service & repair, and OSHA operator training. Nationwide logistics from our Western & Southern service hubs.',
    type: 'website',
    url: 'https://www.flatearthequipment.com/contact',
  },
};

// LocalBusiness + Organization JSON-LD Schema (Enhanced for E-E-A-T)
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
      description: 'Industrial equipment rentals, service & repair, and OSHA-compliant operator training. Telehandlers, boom lifts, scissor lifts, and forklifts.',
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
      areaServed: [
        { '@type': 'State', name: 'Texas' },
        { '@type': 'State', name: 'Arizona' },
        { '@type': 'State', name: 'Colorado' },
        { '@type': 'State', name: 'New Mexico' },
        { '@type': 'State', name: 'Montana' },
        { '@type': 'State', name: 'Wyoming' },
      ],
      parentOrganization: {
        '@id': 'https://www.flatearthequipment.com/#organization',
      },
    },
  ],
};

// Service Areas Data
const serviceAreas = [
  { name: 'Dallas-Fort Worth, TX', href: '/texas/dallas-fort-worth' },
  { name: 'Houston, TX', href: '/texas/houston' },
  { name: 'El Paso, TX', href: '/texas/el-paso' },
  { name: 'Phoenix, AZ', href: '/arizona/phoenix' },
  { name: 'Denver, CO', href: '/colorado/denver' },
  { name: 'Pueblo, CO', href: '/colorado/pueblo' },
  { name: 'Albuquerque, NM', href: '/new-mexico/albuquerque' },
  { name: 'Las Cruces, NM', href: '/new-mexico/las-cruces' },
  { name: 'Bozeman, MT', href: '/montana/bozeman' },
  { name: 'Cheyenne, WY', href: '/wyoming/cheyenne' },
];

// Trust Badges Data
const trustBadges = [
  { icon: '✓', label: 'ANSI & OSHA Compliant' },
  { icon: '🚚', label: 'Nationwide Logistics' },
  { icon: '🛡️', label: 'Fully Insured Rental Fleet' },
];

// Brand Logos (grayscale for manufacturer-grade support signal)
const supportedBrands = [
  { name: 'JLG', initials: 'JLG' },
  { name: 'Genie', initials: 'GENIE' },
  { name: 'JCB', initials: 'JCB' },
  { name: 'Toro', initials: 'TORO' },
];

export default function Contact() {
  return (
    <>
      {/* JSON-LD Schema for E-E-A-T */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Rentals. Service. Training.
              </h1>
              <p className="text-xl text-slate-300 mb-6">
                Your single point of contact for equipment rentals, maintenance, and OSHA-compliant operator certification.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="tel:+18883929175" 
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  888-392-9175
                </a>
                <a 
                  href="mailto:contact@flatearthequipment.com" 
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-white/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Three Pillars Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">How Can We Help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Pillar 1: Equipment Rentals */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Equipment Rentals</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 mb-4">
                    Dispatch-ready aerial equipment for construction, warehouse, and industrial projects.
                  </p>
                  <ul className="space-y-2 mb-6 text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">•</span> Telehandlers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">•</span> Boom Lifts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">•</span> Scissor Lifts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">•</span> Forklifts
                    </li>
                  </ul>
                  <Link 
                    href="/rent-equipment"
                    className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Request Rental Quote
                  </Link>
                </div>
              </div>

              {/* Pillar 2: Service & Repair */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 text-white">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Service & Repair</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 mb-4">
                    Nationwide maintenance network for rentals and customer-owned fleets.
                  </p>
                  <ul className="space-y-2 mb-6 text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="text-slate-500">•</span> Preventive Maintenance
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-500">•</span> Emergency Repairs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-500">•</span> Fleet Management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-slate-500">•</span> Parts & Diagnostics
                    </li>
                  </ul>
                  <Link 
                    href="/service"
                    className="block w-full text-center bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Request Service/Repair
                  </Link>
                </div>
              </div>

              {/* Pillar 3: Operator Training */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Operator Training</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 mb-4">
                    OSHA-compliant certification courses for forklift and aerial lift operators.
                  </p>
                  <ul className="space-y-2 mb-6 text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">•</span> Forklift Certification
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">•</span> Aerial Lift Training
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">•</span> Online + Hands-On
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">•</span> Instant Certificates
                    </li>
                  </ul>
                  <Link 
                    href="/safety"
                    className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    View Certification Courses
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges Section */}
        <section className="py-12 bg-slate-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200">
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="font-semibold text-slate-700">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Support Section */}
        <section className="py-12 border-b border-slate-200">
          <div className="container mx-auto px-4">
            <p className="text-center text-slate-500 text-sm uppercase tracking-wide mb-6">Manufacturer-Grade Support For</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {supportedBrands.map((brand, index) => (
                <div 
                  key={index} 
                  className="text-2xl md:text-3xl font-black text-slate-300 tracking-wider grayscale hover:grayscale-0 hover:text-slate-600 transition-all cursor-default"
                >
                  {brand.initials}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form + Map Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              
              {/* Enhanced Contact Form */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
                <EnhancedContactForm />
              </div>

              {/* Business Details + Map */}
              <div className="space-y-8">
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Headquarters</h2>
                  
                  {/* Phone */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Phone</p>
                    <a 
                      href="tel:+18883929175" 
                      className="text-3xl font-bold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      888-392-9175
                    </a>
                    <p className="text-sm text-slate-500 mt-1">Toll-free, Monday–Friday 8am–5pm MT</p>
                  </div>

                  {/* Address */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Address</p>
                    <address className="text-lg text-slate-700 not-italic leading-relaxed">
                      30 N Gould St, STE R<br />
                      Sheridan, WY 82801<br />
                      United States
                    </address>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Email</p>
                    <a 
                      href="mailto:contact@flatearthequipment.com" 
                      className="text-lg text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      contact@flatearthequipment.com
                    </a>
                  </div>
                </div>

                {/* Google Maps Embed - Lazy Loaded */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2838.5!2d-106.9561!3d44.7972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5335fabc2a66677f%3A0x8f85bd068d1afb8a!2s30%20N%20Gould%20St%2C%20Sheridan%2C%20WY%2082801!5e0!3m2!1sen!2sus!4v1704067200000"
                    width="100%"
                    height="280"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Flat Earth Equipment - Sheridan, WY Office Location"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regional Authority Section - Service Area Hub */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Western & Southern Service Hubs</h2>
              <p className="text-slate-400 text-lg">
                Strategically located across the Mountain West and Sun Belt for rapid equipment dispatch and local service support.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {serviceAreas.map((area, index) => (
                <Link 
                  key={index}
                  href={area.href}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-center transition-colors group"
                >
                  <span className="text-white group-hover:text-amber-400 transition-colors font-medium">
                    {area.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                href="/locations"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                View All Service Locations
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Training Support Note */}
        <section className="py-12 bg-emerald-50 border-t border-emerald-100">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Training Support
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Need Help With Your Certification?</h3>
              <p className="text-slate-600 mb-4">
                For course content questions, check the help sections within each module. If you're in a company program, contact your trainer directly. For enrollment or certificate issues, include your enrollment ID in your message above.
              </p>
              <Link 
                href="/safety"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Browse Training Courses
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
