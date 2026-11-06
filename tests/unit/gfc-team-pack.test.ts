import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const checkout = readFileSync('app/api/checkout/route.ts', 'utf8');
const recovery = readFileSync('lib/training/checkoutRecovery.server.ts', 'utf8');
const welcome = readFileSync('lib/email/gfcTrainerWelcome.ts', 'utf8');

test('GFC team packs are excluded from operator checkout behavior', () => {
  assert.match(checkout, /isGfcTeamPack\s*=\s*isGfcSession && checkoutMode === 'payment' && isTrainingPurchase && metadata\.quantity !== '1'/);
  assert.match(checkout, /isGfcOperatorSession\s*=\s*isGfcSession && checkoutMode === 'payment' && isTrainingPurchase && !isGfcTeamPack/);
});

test('GFC team packs get manager submit copy, not operator copy', () => {
  assert.match(checkout, /isGfcTeamPack\s*\?\s*'One-time payment, no subscription\. Your manager dashboard login/);
});

test('operator recovery emails only target single-seat sessions', () => {
  assert.match(recovery, /\(session\.metadata\?\.quantity \?\? '1'\) === '1'/);
});

test('GFC welcome email labels the 5-seat pack', () => {
  assert.match(welcome, /pack5: 'Team pack — 5 training seats, \$225 one-time'/);
});
