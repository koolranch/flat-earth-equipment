import crypto from 'node:crypto';

function getSecret() {
  const s = process.env.CERT_SIGNING_SECRET;
  if (!s) {
    console.warn('[cert/sign] CERT_SIGNING_SECRET not set, using fallback');
    return 'fallback-secret-please-set-env-var-in-production';
  }
  return s;
}

export function signPayload(payload: unknown) {
  const secret = getSecret();
  const json = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', secret).update(json).digest('hex');
  return { json, signature: sig } as const;
}

export function verifyPayload(json: string, signature: string) {
  const secret = getSecret();
  const expected = crypto.createHmac('sha256', secret).update(json).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
