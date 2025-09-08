const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Flat Earth Equipment';
const CONTACT = process.env.LEGAL_CONTACT_EMAIL || 'contact@flatearthequipment.com';

export const metadata = { title: `Privacy Policy — ${COMPANY}` };

export default function Page(){
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p>We collect only what we need to deliver certificates and training records. We do not sell personal data.</p>
      <h2>Data We Collect</h2>
      <ul>
        <li>Account and enrollment information (name, email).</li>
        <li>Training progress, quiz results, and issued certificates.</li>
        <li>Technical analytics to improve the product.</li>
      </ul>
      <h2>Your Rights</h2>
      <p>Request access or deletion at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </article>
  );
}
