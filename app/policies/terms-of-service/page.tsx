import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service | Flat Earth Equipment",
  description: "Read the terms of service for Flat Earth Equipment. These terms govern your use of our website, parts catalog, and quote request process.",
};

export default function TermsOfServicePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>

      <p className="text-slate-700 mb-6">
        These Terms of Service ("Terms") govern your access to and use of flatearthequipment.com, including all content, features, and quote request services (collectively, the "Site") provided by Flat Earth Equipment.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">1. Use of Site</h2>
        <p className="text-slate-700">
          You agree to use the Site for lawful business purposes only. You may not use the Site to transmit false quote requests, scrape data, or interfere with our operations.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">2. Product Information</h2>
        <p className="text-slate-700">
          We make every effort to provide accurate product information, but specifications, availability, and pricing may change without notice. All parts are aftermarket unless stated otherwise.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">3. Quotes & Orders</h2>
        <p className="text-slate-700">
          Submitted quote requests do not constitute a purchase agreement. Pricing, availability, and shipping timelines will be confirmed by our team before fulfillment.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">4. Warranty</h2>
        <p className="text-slate-700">
          Unless otherwise stated, all parts are backed by a 6-month limited warranty against defects in materials or workmanship. Improper installation or misuse voids the warranty.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">5. Limitation of Liability</h2>
        <p className="text-slate-700">
          Flat Earth Equipment is not liable for indirect, incidental, or consequential damages resulting from the use or inability to use parts sold through our Site.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">6. Policy Changes</h2>
        <p className="text-slate-700">
          We reserve the right to update these Terms at any time. Continued use of the Site after changes are posted constitutes your acceptance.
        </p>
        <p className="text-slate-600 mt-2 text-sm">Last updated: May 2024</p>
      </section>

      <hr className="my-8" />

      <section className="text-sm text-slate-600">
        <p>Flat Earth Equipment – Corporate Office</p>
        <p>30 N Gould St., Ste R<br />Sheridan, WY 82801</p>
        <p className="mt-2">Email: <a href="mailto:contact@flatearthequipment.com" className="text-canyon-rust underline">contact@flatearthequipment.com</a></p>
        <p>Phone: <a href="tel:+13073020043" className="text-canyon-rust underline">(307) 302-0043‬</a></p>
      </section>
    </main>
  );
} 