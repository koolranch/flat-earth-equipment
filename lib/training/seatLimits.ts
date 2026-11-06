/**
 * Extra-seat limits for capped subscription orders. Orders do not record
 * their plan, so the base seat count tells them apart: Facility starts at 50,
 * and anything smaller is a Crew order (10 seats plus extras).
 */
export const CREW_MAX_SEATS = 25;
export const FACILITY_BASE_SEATS = 50;
export const MAX_EXTRA_SEATS_PER_PURCHASE = 25;

/** How many more seats this order may buy right now. */
export function extraSeatsAllowed(seats: number | null | undefined): number {
  const current = seats ?? 0;
  if (current >= FACILITY_BASE_SEATS) return MAX_EXTRA_SEATS_PER_PURCHASE;
  return Math.max(0, Math.min(MAX_EXTRA_SEATS_PER_PURCHASE, CREW_MAX_SEATS - current));
}
