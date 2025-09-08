import { URL } from 'node:url';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'https://www.example.com';
const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Flat Earth Equipment';
const SENDER_DOMAIN = process.env.SENDER_DOMAIN || new URL(BASE).hostname.replace(/^www\./,'');

const providers = [
  { key: 'RESEND_API_KEY', name: 'Resend', docs: 'https://resend.com/docs/sending-domains', spf: '(from dashboard)', dkim: '(add CNAME from dashboard)' },
  { key: 'SENDGRID_API_KEY', name: 'SendGrid', docs: 'https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication', spf: 'include:sendgrid.net', dkim: '(CNAME s1 & s2 from dashboard)' },
  { key: 'POSTMARK_SERVER_TOKEN', name: 'Postmark', docs: 'https://postmarkapp.com/support/article/1007-how-do-i-set-up-dkim-spf-and-return-path', spf: 'include:spf.mtasv.net', dkim: 'pm._domainkey (TXT) from dashboard' },
  { key: 'MAILGUN_API_KEY', name: 'Mailgun', docs: 'https://help.mailgun.com/hc/en-us/articles/360026833053-How-Do-I-Add-Set-up-DNS-Records', spf: 'include:mailgun.org', dkim: '(CNAME records from dashboard)' }
];

const detected = providers.filter(p => !!process.env[p.key]);

function line(msg){ console.log(msg); }
function hr(){ console.log('\n' + '-'.repeat(60) + '\n'); }

console.log(`\nEmail Deliverability Audit for ${COMPANY} (${SENDER_DOMAIN})`);

if (detected.length === 0){
  hr();
  line('❌ No email provider env key detected.');
  line('   Set one of: RESEND_API_KEY / SENDGRID_API_KEY / POSTMARK_SERVER_TOKEN / MAILGUN_API_KEY');
  process.exit(1);
}

hr();
for (const p of detected){
  line(`✅ Provider detected: ${p.name} (env: ${p.key})`);
  line(`   Docs: ${p.docs}`);
}

hr();
line('Suggested DNS baseline (adjust per provider dashboard):');
line('  • SPF (TXT at ' + SENDER_DOMAIN + '):');
for (const p of detected){
  line(`    v=spf1 ${p.spf === '(from dashboard)' ? '<provider-include-here>' : p.spf} ~all`);
}
line('\n  • DMARC (TXT at _dmarc.' + SENDER_DOMAIN + '):');
line(`    v=DMARC1; p=${process.env.DMARC_POLICY || 'quarantine'}; rua=mailto:${process.env.LEGAL_CONTACT_EMAIL || 'contact@' + SENDER_DOMAIN}; adkim=s; aspf=s`);

line('\n  • DKIM: add provider-issued DKIM records from your provider dashboard');

hr();
line('Next steps:');
line('  1) Add the DNS records above in your DNS host (registrar/Cloudflare/Route53).');
line('  2) In your provider dashboard, verify the domain until all checks pass.');
line('  3) Send a live test to multiple inboxes (Gmail/Outlook/work).');
line('\nTip: Run `npm run qa:email` any time for these reminders.');
