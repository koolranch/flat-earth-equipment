/**
 * Ship-to tax line for charger modules.
 *
 * TVH taxes the wholesale invoice when we have no resale certificate for the
 * delivery state. The module sell price stays unchanged. Checkout adds one
 * line at the state general rate times wholesale cost.
 *
 * Rates are the state general rate (parts per 100,000). Michigan is 6% with
 * no city or county add-on, so that line matches the vendor invoice. Other
 * states can still have a local add-on on the vendor bill.
 *
 * ACT Quantum repair offers have no wholesale cost on file, so they get no
 * line until a cost is added here.
 */

export type ShipToState = {
  code: string;
  name: string;
  /** State general rate in hundred-thousandths. 6% = 6000. */
  ratePer100k: number;
};

export const US_SHIP_TO_STATES: ShipToState[] = [
  { code: 'AL', name: 'Alabama', ratePer100k: 4000 },
  { code: 'AK', name: 'Alaska', ratePer100k: 0 },
  { code: 'AZ', name: 'Arizona', ratePer100k: 5600 },
  { code: 'AR', name: 'Arkansas', ratePer100k: 6500 },
  { code: 'CA', name: 'California', ratePer100k: 7250 },
  { code: 'CO', name: 'Colorado', ratePer100k: 2900 },
  { code: 'CT', name: 'Connecticut', ratePer100k: 6350 },
  { code: 'DE', name: 'Delaware', ratePer100k: 0 },
  { code: 'DC', name: 'District of Columbia', ratePer100k: 6000 },
  { code: 'FL', name: 'Florida', ratePer100k: 6000 },
  { code: 'GA', name: 'Georgia', ratePer100k: 4000 },
  { code: 'HI', name: 'Hawaii', ratePer100k: 4166 },
  { code: 'ID', name: 'Idaho', ratePer100k: 6000 },
  { code: 'IL', name: 'Illinois', ratePer100k: 6250 },
  { code: 'IN', name: 'Indiana', ratePer100k: 7000 },
  { code: 'IA', name: 'Iowa', ratePer100k: 6000 },
  { code: 'KS', name: 'Kansas', ratePer100k: 6500 },
  { code: 'KY', name: 'Kentucky', ratePer100k: 6000 },
  { code: 'LA', name: 'Louisiana', ratePer100k: 5000 },
  { code: 'ME', name: 'Maine', ratePer100k: 5500 },
  { code: 'MD', name: 'Maryland', ratePer100k: 6000 },
  { code: 'MA', name: 'Massachusetts', ratePer100k: 6250 },
  { code: 'MI', name: 'Michigan', ratePer100k: 6000 },
  { code: 'MN', name: 'Minnesota', ratePer100k: 6875 },
  { code: 'MS', name: 'Mississippi', ratePer100k: 7000 },
  { code: 'MO', name: 'Missouri', ratePer100k: 4225 },
  { code: 'MT', name: 'Montana', ratePer100k: 0 },
  { code: 'NE', name: 'Nebraska', ratePer100k: 5500 },
  { code: 'NV', name: 'Nevada', ratePer100k: 6850 },
  { code: 'NH', name: 'New Hampshire', ratePer100k: 0 },
  { code: 'NJ', name: 'New Jersey', ratePer100k: 6625 },
  { code: 'NM', name: 'New Mexico', ratePer100k: 5125 },
  { code: 'NY', name: 'New York', ratePer100k: 4000 },
  { code: 'NC', name: 'North Carolina', ratePer100k: 4750 },
  { code: 'ND', name: 'North Dakota', ratePer100k: 5000 },
  { code: 'OH', name: 'Ohio', ratePer100k: 5750 },
  { code: 'OK', name: 'Oklahoma', ratePer100k: 4500 },
  { code: 'OR', name: 'Oregon', ratePer100k: 0 },
  { code: 'PA', name: 'Pennsylvania', ratePer100k: 6000 },
  { code: 'RI', name: 'Rhode Island', ratePer100k: 7000 },
  { code: 'SC', name: 'South Carolina', ratePer100k: 6000 },
  { code: 'SD', name: 'South Dakota', ratePer100k: 4200 },
  { code: 'TN', name: 'Tennessee', ratePer100k: 7000 },
  { code: 'TX', name: 'Texas', ratePer100k: 6250 },
  { code: 'UT', name: 'Utah', ratePer100k: 6100 },
  { code: 'VT', name: 'Vermont', ratePer100k: 6000 },
  { code: 'VA', name: 'Virginia', ratePer100k: 5300 },
  { code: 'WA', name: 'Washington', ratePer100k: 6500 },
  { code: 'WV', name: 'West Virginia', ratePer100k: 6000 },
  { code: 'WI', name: 'Wisconsin', ratePer100k: 5000 },
  { code: 'WY', name: 'Wyoming', ratePer100k: 4000 },
];

const STATE_BY_CODE = new Map(US_SHIP_TO_STATES.map((state) => [state.code, state]));

/** Wholesale cost in cents, keyed by the live Stripe price id. */
const WHOLESALE_CENTS_BY_PRICE_ID: Record<string, number> = {
  // Enersys 6LA20671 reman / repair
  price_1TVz7dHJI548rO8J6EyQMzlr: 52600,
  price_1RsZDBHJI548rO8JhS1sUEAQ: 44400,
  // Hawker 6LA20671 reman / repair
  price_1TVz7eHJI548rO8JLoKh6iIk: 52600,
  price_1TbkeEHJI548rO8JRm07O00v: 44400,
  // ACT Quantum reman exchange (36 / 48 / 80 VDC)
  price_1TWyysHJI548rO8JuLkbioA4: 51300,
  price_1TWyyuHJI548rO8J1rqhn4G5: 51300,
  price_1TWyyvHJI548rO8JOYD7C9LJ: 51300,
};

export function chargerModuleWholesaleCents(priceId: string | null | undefined): number | null {
  if (!priceId) return null;
  const cost = WHOLESALE_CENTS_BY_PRICE_ID[priceId];
  return cost == null ? null : cost;
}

export function shipToStateName(stateCode: string | null | undefined): string | null {
  if (!stateCode) return null;
  return STATE_BY_CODE.get(stateCode.trim().toUpperCase())?.name ?? null;
}

/** Per-unit ship-to tax in cents. Null when this price has no wholesale cost or the state is unknown. Zero when the state general rate is zero. */
export function shipTaxPerUnitCents(
  priceId: string | null | undefined,
  stateCode: string | null | undefined,
): number | null {
  const cost = chargerModuleWholesaleCents(priceId);
  if (cost == null || !stateCode) return null;
  const state = STATE_BY_CODE.get(stateCode.trim().toUpperCase());
  if (!state) return null;
  if (state.ratePer100k === 0) return 0;
  return Math.round((cost * state.ratePer100k) / 100_000);
}
