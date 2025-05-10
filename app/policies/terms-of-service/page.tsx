import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Flat Earth Equipment',
  description: 'Read our terms of service and conditions for using Flat Earth Equipment\'s website and services.',
};

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <div className="prose prose-slate">
          <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
        <div className="prose prose-slate">
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on Flat Earth Equipment's website for personal, non-commercial transitory viewing only.</p>
          <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
        <div className="prose prose-slate">
          <p>The materials on Flat Earth Equipment's website are provided on an 'as is' basis. Flat Earth Equipment makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
        <div className="prose prose-slate">
          <p>In no event shall Flat Earth Equipment or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Flat Earth Equipment's website.</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">5. Contact Information</h2>
        <div className="prose prose-slate">
          <p>If you have any questions about these Terms of Service, please contact us:</p>
          <ul>
            <li>Email: legal@flatearthequipment.com</li>
            <li>Phone: (555) 123-4567</li>
            <li>Address: 123 Business Street, City, State 12345</li>
          </ul>
        </div>
      </section>
    </main>
  );
} 