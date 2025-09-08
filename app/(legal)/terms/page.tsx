const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Flat Earth Equipment';
const CONTACT = process.env.LEGAL_CONTACT_EMAIL || 'contact@flatearthequipment.com';

export const metadata = { title: `Terms of Service — ${COMPANY}` };

export default function Page(){
  return (
    <article>
      <h1>Terms of Service</h1>
      <p>Welcome to {COMPANY}. By using our training products you agree to these terms. This is a human-readable summary; your purchase or use constitutes acceptance.</p>
      <h2>Use of Service</h2>
      <p>Training content is provided for educational purposes and to assist OSHA compliance. Employers remain responsible for site-specific training and evaluation.</p>
      <h2>Payments & Refunds</h2>
      <p>Payments are processed securely via our provider. Refunds are handled per our Refund Policy.</p>
      <h2>Contact</h2>
      <p>Questions? Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </article>
  );
}
