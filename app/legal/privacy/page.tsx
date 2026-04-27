import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Flat Earth Equipment training and certification platform. Learn how we collect, store, and protect your data.',
  alternates: {
    canonical: 'https://www.flatearthequipment.com/legal/privacy',
  },
};

export default function Privacy() {
  return (
    <main className="container mx-auto p-4 prose">
      <h1>Privacy Policy</h1>
      <p>We collect what we need to run training and keep records—name, email, progress, scores, certificates, and evaluations.</p>
      
      <h2>Storage</h2>
      <p>Data is stored in Supabase. Certificates and evaluations live in secure buckets.</p>
      
      <h2>Sharing</h2>
      <p>We share records with your employer when you enroll via them or give consent.</p>
      
      <h2>Cookies</h2>
      <p>We use essential cookies for login and language preferences. Analytics cookies help improve the platform.</p>

      <h2>Asking your employer to pay</h2>
      <p>If you use the &ldquo;Ask your employer to pay&rdquo; feature in our mobile app, we collect the employer name and email address you provide, along with an optional message. We use this information solely to send a one-time email to the employer on your behalf. We do not share it with third parties or use it for marketing. We retain these records for 7 years to comply with business records retention requirements tied to financial transactions.</p>
      <ul>
        <li>Employer name (when you use the ask-employer feature) — optional, encrypted in transit, retained 7 years, not shared with third parties beyond the named employer.</li>
        <li>Employer email address (when you use the ask-employer feature) — optional, encrypted in transit, retained 7 years, not shared with third parties beyond the named employer.</li>
        <li>Optional message text (when you use the ask-employer feature) — optional, encrypted in transit, retained 7 years, not shared with third parties beyond the named employer.</li>
      </ul>

      <h2>Your Rights</h2>
      <p>You can request your data or account deletion. Some training records may need to be retained for compliance.</p>
      
      <h2>Contact</h2>
      <p>Email contact@flatearthequipment.com for questions.</p>
      
      <p className="text-sm text-gray-600 mt-8">Last updated: January 2025</p>
    </main>
  );
}
