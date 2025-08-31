const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0,O,1,I

export function randomCode(len = 10) {
  let out = '';
  const bytes = new Uint8Array(len);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    (crypto as any).getRandomValues(bytes);
  } else {
    const nodeCrypto = require('node:crypto');
    nodeCrypto.randomFillSync(bytes);
  }
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}
