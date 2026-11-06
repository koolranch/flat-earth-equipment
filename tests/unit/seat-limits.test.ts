import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { CREW_MAX_SEATS, extraSeatsAllowed } from '../../lib/training/seatLimits';

test('Crew orders can grow to 25 seats and no further', () => {
  assert.equal(CREW_MAX_SEATS, 25);
  assert.equal(extraSeatsAllowed(10), 15);
  assert.equal(extraSeatsAllowed(24), 1);
  assert.equal(extraSeatsAllowed(25), 0);
});

test('Facility orders (50 base seats) keep buying extra seats', () => {
  assert.equal(extraSeatsAllowed(50), 25);
  assert.equal(extraSeatsAllowed(80), 25);
});

test('add-seats route and orders API both enforce the cap', () => {
  const addSeats = readFileSync('app/api/trainer/orders/add-seats/route.ts', 'utf8');
  const orders = readFileSync('app/api/trainer/orders/route.ts', 'utf8');
  assert.match(addSeats, /extraSeatsAllowed\(order\.seats\)/);
  assert.match(addSeats, /seat_cap_reached/);
  assert.match(orders, /can_add_seats: maxExtraSeats > 0/);
});
