import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Shipping & Returns | Flat Earth Equipment",
  description: "View our shipping and return policies for replacement parts. Fast quotes, nationwide delivery, and simple returns with Flat Earth Equipment.",
};

export default function ShippingAndReturnsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Shipping & Returns</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Shipping Policy</h2>
        <p className="text-slate-700 leading-relaxed">
          We ship to all 50 U.S. states using trusted carriers like UPS, FedEx, and USPS. Most in-stock orders are processed the same day when placed by 2PM Mountain Time.  
        </p>
        <p className="text-slate-700 mt-2">
          Shipping costs are calculated at checkout or quoted via email. We also offer freight solutions for bulk orders. Flat Earth Equipment is not responsible for carrier delays once an order has shipped.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Return Policy</h2>
        <p className="text-slate-700 leading-relaxed">
          We accept returns within 30 days of delivery for most unused, undamaged parts in their original packaging. You must request a return authorization before shipping the item back.
        </p>
        <p className="text-slate-700 mt-2">
          To request a return, email us at <a href="mailto:contact@flatearthequipment.com" className="text-canyon-rust underline">contact@flatearthequipment.com</a> with your order number and part number.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Restocking & Refunds</h2>
        <p className="text-slate-700 leading-relaxed">
          All approved returns are subject to a 25% restocking fee. Refunds will be processed to your original payment method within 5–7 business days after inspection.
        </p>
        <p className="text-slate-700 mt-2">
          Shipping costs are non-refundable. Custom or special-order parts may not be eligible for return unless defective.
        </p>
      </section>

      <hr className="my-8" />

      <section className="text-sm text-slate-600">
        <p>Flat Earth Equipment – Corporate Office</p>
        <p>30 N Gould St., Ste R<br />Sheridan, WY 82801</p>
        <p className="mt-2">Support: <a href="mailto:contact@flatearthequipment.com" className="text-canyon-rust underline">contact@flatearthequipment.com</a></p>
        <p>Phone: <a href="tel:+13073020043" className="text-canyon-rust underline">(307) 302-0043‬</a></p>
        <p>Hours: Monday–Friday, 7AM–5PM (Mountain Time)</p>
      </section>
    </main>
  );
} 