export const metadata = {
  title: 'Shipping & Returns | Flat Earth Equipment',
  description: 'Our shipping policies, cutoff times, regions served, and return procedures.',
}

export default function ShippingReturns() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Shipping & Returns</h1>
      <h2>Shipping</h2>
      <p>We offer same-day shipping on in-stock parts for orders placed by 3 PM MST. We ship nationwide via UPS and FedEx.</p>
      <ul>
        <li>Free shipping on orders over $1,000</li>
        <li>Flat-rate $25 shipping fee under $1,000</li>
        <li>Expedited shipping options available at checkout</li>
      </ul>
      <h2>Returns & Exchanges</h2>
      <p>You may return non-installed parts within 30 days for a full refund. Core charges apply where noted.</p>
      <ol>
        <li>Contact <a href="mailto:contact@flatearthequipment.com">contact@flatearthequipment.com</a> to request a Return Authorization (RA#).</li>
        <li>Ship items to our Sheridan, WY facility at your expense, unless the part is defective.</li>
        <li>Once received, we inspect and process your refund within 5 business days.</li>
      </ol>
      <h2>Defective or Incorrect Items</h2>
      <p>If you receive a defective or incorrect part, we'll cover return shipping and send you a replacement immediately.</p>
    </main>
  )
} 