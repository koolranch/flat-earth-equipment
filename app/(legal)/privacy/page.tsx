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
        <li>Employer name (when you use the ask-employer feature) — optional, encrypted in transit, retained 7 years, not shared with third parties beyond the named employer.</li>
        <li>Employer email address (when you use the ask-employer feature) — optional, encrypted in transit, retained 7 years, not shared with third parties beyond the named employer.</li>
        <li>Optional message text (when you use the ask-employer feature) — optional, encrypted in transit, retained 7 years, not shared with third parties beyond the named employer.</li>
      </ul>
      <h2>Asking your employer to pay</h2>
      <p>If you use the &ldquo;Ask your employer to pay&rdquo; feature in our mobile app, we collect the employer name and email address you provide, along with an optional message. We use this information solely to send a one-time email to the employer on your behalf. We do not share it with third parties or use it for marketing. We retain these records for 7 years to comply with business records retention requirements tied to financial transactions.</p>
      <h2>Your Rights</h2>
      <p>Request access or deletion at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </article>
  );
}
