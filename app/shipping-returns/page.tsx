export const metadata = {
  title: 'Shipping & Returns | Flat Earth Equipment',
  description:
    'United States shipping with freight calculated at checkout. Returns need our instructions first. A 25% restocking fee applies when the part is not defective and not a warranty claim.',
}

export default function ShippingReturns() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Shipping & Returns</h1>
      <h2>Shipping</h2>
      <p>
        We ship to addresses in the United States. Freight is calculated at checkout from the part
        and the ship-to address, and you see it before you pay. When a part includes freight in the
        price, the product page says so.
      </p>
      <h2>Returns</h2>
      <p>
        You can return an unused, uninstalled part within 90 days of delivery. Email{' '}
        <a href="mailto:parts@flatearthequipment.com">parts@flatearthequipment.com</a> with your order
        number before you ship anything. We reply with return instructions for every return,
        including where to send the part. Do not ship a return to our Sheridan, Wyoming office.
      </p>
      <p>
        A return that is not a defective part and not a warranty claim has a 25% restocking fee.
        You pay the return freight unless the instructions say we cover it.
      </p>
      <p>
        Defective parts, parts we sent by mistake, and warranty claims do not have a restocking fee.
        The instructions say where to send the part and whether we cover the return freight.
      </p>
      <p>
        A core deposit is separate from the part price and from the restocking fee. Follow the
        return instructions for the core.
      </p>
      <p>
        After the return arrives and we inspect it, we refund the eligible amount to the original
        payment method within 5 business days.
      </p>
      <h2>Warranty</h2>
      <p>
        Eligible aftermarket parts carry a 2-year warranty. Battery chargers, controllers, charger
        modules, and parts with a core charge follow the coverage on the product page. Start a claim
        the same way: email us and wait for return instructions. Details are on the{' '}
        <a href="/warranty">warranty</a> page.
      </p>
    </main>
  )
}
