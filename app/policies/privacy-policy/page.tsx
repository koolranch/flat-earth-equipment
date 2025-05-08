import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy | Flat Earth Equipment",
  description: "Learn how Flat Earth Equipment collects, uses, and protects your information when you browse or request parts on our site.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>

      <p className="text-slate-700 mb-6">
        This Privacy Policy explains how Flat Earth Equipment ("we", "our", or "us") collects, uses, and protects your information when you use our website, request a quote, or contact us.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">What We Collect</h2>
        <p className="text-slate-700">
          When you submit a quote request or contact form, we collect your name, email address, and any part-related details you choose to provide. We may also collect non-identifying data like browser type or IP address for analytics purposes.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">How We Use Your Info</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-2">
          <li>To respond to your part requests and provide accurate quotes</li>
          <li>To contact you about your inquiry or order</li>
          <li>To improve our website and customer experience</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Data Sharing</h2>
        <p className="text-slate-700">
          We do not sell or rent your personal information. Your data may be shared with logistics or fulfillment partners only to complete your order or delivery.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Your Rights</h2>
        <p className="text-slate-700">
          You may request to review, update, or delete your personal information by contacting us at <a href="mailto:contact@flatearthequipment.com" className="text-canyon-rust underline">contact@flatearthequipment.com</a>.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Security</h2>
        <p className="text-slate-700">
          We use secure protocols (HTTPS) and data access controls to help protect your information. However, no system is 100% secure, and we encourage you to use caution when submitting sensitive details online.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Policy Updates</h2>
        <p className="text-slate-700">
          We may update this Privacy Policy as our services evolve. The most recent version will always be posted here.
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