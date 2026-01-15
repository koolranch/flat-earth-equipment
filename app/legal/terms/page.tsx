import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Flat Earth Equipment training and certification platform. Rules for account usage, refunds, and liability.',
  alternates: {
    canonical: 'https://www.flatearthequipment.com/legal/terms',
  },
};

export default function Terms() {
  return (
    <main className="container mx-auto p-4 prose">
      <h1>Terms of Service</h1>
      <p>Use this training responsibly. You are responsible for meeting your employer policies and site rules. We provide the training and records; you operate safely.</p>
      
      <h2>Accounts</h2>
      <p>Do not share logins. We can suspend accounts for abuse.</p>
      
      <h2>Refunds</h2>
      <p>Contact us within 14 days if you have not started the course.</p>
      
      <h2>Liability</h2>
      <p>We do not control your worksite. Always follow your company rules and OSHA.</p>
      
      <h2>Updates</h2>
      <p>We may update these terms. Continued use means you accept changes.</p>
      
      <p className="text-sm text-gray-600 mt-8">Last updated: January 2025</p>
    </main>
  );
}
