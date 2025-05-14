export const metadata = {
  title: 'Warranty | Flat Earth Equipment',
  description: 'Learn about our 6-month warranty on all parts and how to initiate a claim.',
}

export default function Warranty() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Warranty</h1>
      <p>All parts purchased through Flat Earth Equipment come with a 6-month warranty covering defects in materials and workmanship.</p>
      <h2>What's Covered</h2>
      <ul>
        <li>Defective components due to manufacturing faults</li>
        <li>Free repair or replacement within 6 months of delivery</li>
      </ul>
      <h2>What's Not Covered</h2>
      <ul>
        <li>Normal wear and tear</li>
        <li>Damage from improper installation or misuse</li>
      </ul>
      <h2>How to File a Claim</h2>
      <p>Email <a href="mailto:contact@flatearthequipment.com">contact@flatearthequipment.com</a> with your order number and photos of the defect. We'll guide you through the return or repair process.</p>
    </main>
  )
} 