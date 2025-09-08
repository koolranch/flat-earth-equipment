const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Flat Earth Equipment';
const CONTACT = process.env.LEGAL_CONTACT_EMAIL || 'contact@flatearthequipment.com';

export const metadata = { title: `Refund Policy — ${COMPANY}` };

export default function Page(){
  return (
    <article>
      <h1>Refund Policy</h1>
      <p>If something isn&apos;t right, contact us. We&apos;ll work with you in good faith to make it right.</p>
      <ul>
        <li>Refunds considered within 14 days if training not yet completed/used.</li>
        <li>Seat transfers available prior to completion.</li>
      </ul>
      <p>Contact: <a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
    </article>
  );
}
