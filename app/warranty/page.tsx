export const metadata = {
  title: 'Warranty | Flat Earth Equipment',
  description:
    '2-year warranty on aftermarket JCB, Bobcat, and forklift parts plus rubber tracks. How coverage works and how to file a claim.',
};

export default function Warranty() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Warranty</h1>
      <p>
        Aftermarket JCB parts, Bobcat parts, forklift parts, and rubber tracks purchased through Flat
        Earth Equipment include a <strong>2-year warranty</strong> covering defects in materials and
        workmanship from the date of delivery.
      </p>
      <p>
        Battery chargers, controllers, charger modules, remanufactured core-exchange items, and other
        products with a core charge follow the coverage stated on that product page (often a shorter
        remanufactured or module-specific warranty).
      </p>
      <h2>What&apos;s Covered</h2>
      <ul>
        <li>Defective components due to manufacturing faults</li>
        <li>Free repair or replacement within the warranty period for covered SKUs</li>
      </ul>
      <h2>What&apos;s Not Covered</h2>
      <ul>
        <li>Normal wear and tear</li>
        <li>Damage from improper installation or misuse</li>
      </ul>
      <h2>How to File a Claim</h2>
      <p>
        Email{' '}
        <a href="mailto:parts@flatearthequipment.com">parts@flatearthequipment.com</a> with your
        order number and photos of the defect. We&apos;ll guide you through the return or repair
        process.
      </p>
    </main>
  );
}
