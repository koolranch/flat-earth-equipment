import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Returns | Flat Earth Equipment',
  description: 'Learn about our shipping and returns policies for industrial equipment and parts.',
};

export default function ShippingAndReturnsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shipping & Returns Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
        <div className="prose prose-slate">
          <p>We offer shipping to all 50 states and Canada. Most orders are processed and shipped within 1-2 business days.</p>
          <h3>Shipping Methods</h3>
          <ul>
            <li>Standard Ground Shipping (3-5 business days)</li>
            <li>Expedited Shipping (2-3 business days)</li>
            <li>Express Shipping (1-2 business days)</li>
          </ul>
          <p>Shipping costs are calculated based on the weight and dimensions of your order, as well as the destination.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Returns Policy</h2>
        <div className="prose prose-slate">
          <p>We accept returns within 30 days of delivery for most items. To be eligible for a return, your item must be unused and in the same condition that you received it.</p>
          <h3>Return Process</h3>
          <ol>
            <li>Contact our customer service team to initiate a return</li>
            <li>Package the item securely with all original packaging</li>
            <li>Include the return authorization number on the package</li>
            <li>Ship the item back to our warehouse</li>
          </ol>
          <p>Once your return is received and inspected, we will process your refund within 5-7 business days.</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <div className="prose prose-slate">
          <p>If you have any questions about our shipping or returns policy, please contact us:</p>
          <ul>
            <li>Email: support@flatearthequipment.com</li>
            <li>Phone: (555) 123-4567</li>
            <li>Hours: Monday-Friday, 9am-5pm EST</li>
          </ul>
        </div>
      </section>
    </main>
  );
} 