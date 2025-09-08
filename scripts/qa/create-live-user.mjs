import 'node:process';
import https from 'node:https';

const HOST = process.env.QA_HOST || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com';
const TOKEN = process.env.QA_USER_TOKEN; // read from your local shell just to sign the request
if (!TOKEN) {
  console.error('Missing QA_USER_TOKEN in your local environment.');
  process.exit(1);
}

const payload = {
  course_slug: process.env.QA_COURSE || 'forklift_operator',
  locale: process.env.QA_LOCALE || 'en',
  email_domain: process.env.QA_EMAIL_DOMAIN || 'example.test',
  prefix: process.env.QA_PREFIX || 'qa'
};

const data = JSON.stringify(payload);

const url = new URL('/api/qa/create-test-user', HOST);
const opts = {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-qa-token': TOKEN,
    'content-length': Buffer.byteLength(data)
  }
};

const req = https.request(url, opts, (res) => {
  let body = '';
  res.on('data', (c) => (body += c));
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      if (!json.ok) {
        console.error('Error:', json.error || body);
        process.exit(1);
      }
      console.log('\n✅ Live QA user created');
      console.log('Email   :', json.email);
      console.log('Password:', json.password);
      console.log('Course  :', json.course_slug);
      console.log('Locale  :', json.locale);
      console.log(`\nLogin at: ${HOST}/login`);
    } catch (e) {
      console.error('Parse error:', e.message, '\nRaw:', body);
      process.exit(1);
    }
  });
});
req.on('error', (e) => {
  console.error('Request failed:', e.message);
  process.exit(1);
});
req.write(data);
req.end();
