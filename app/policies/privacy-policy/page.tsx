import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Flat Earth Equipment',
  description: 'Learn how Flat Earth Equipment collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
        <div className="prose prose-slate">
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li>Name and contact information</li>
            <li>Company information</li>
            <li>Order history and preferences</li>
            <li>Payment information</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
        <div className="prose prose-slate">
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process your orders and payments</li>
            <li>Communicate with you about your orders</li>
            <li>Send you marketing communications (with your consent)</li>
            <li>Improve our website and services</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
        <div className="prose prose-slate">
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Payment processors for secure transactions</li>
            <li>Shipping partners to deliver your orders</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
        <div className="prose prose-slate">
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
        <div className="prose prose-slate">
          <p>If you have any questions about our Privacy Policy, please contact us:</p>
          <ul>
            <li>Email: privacy@flatearthequipment.com</li>
            <li>Phone: (555) 123-4567</li>
            <li>Address: 123 Business Street, City, State 12345</li>
          </ul>
        </div>
      </section>
    </main>
  );
} 