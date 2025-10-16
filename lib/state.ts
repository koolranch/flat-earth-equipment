export const STATE_TO_USPS: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT',
  delaware: 'DE', 'district-of-columbia': 'DC', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL',
  indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA',
  michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new-hampshire': 'NH', 'new-jersey': 'NJ', 'new-mexico': 'NM', 'new-york': 'NY', 'north-carolina': 'NC', 'north-dakota': 'ND',
  ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC', 'south-dakota': 'SD',
  tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA', 'west-virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY',
  // 2-letter codes for compatibility with existing pages
  al: 'AL', ak: 'AK', az: 'AZ', ar: 'AR', ca: 'CA', co: 'CO', ct: 'CT',
  de: 'DE', dc: 'DC', fl: 'FL', ga: 'GA', hi: 'HI', id: 'ID', il: 'IL',
  in: 'IN', ia: 'IA', ks: 'KS', ky: 'KY', la: 'LA', me: 'ME', md: 'MD', ma: 'MA',
  mi: 'MI', mn: 'MN', ms: 'MS', mo: 'MO', mt: 'MT', ne: 'NE', nv: 'NV',
  nh: 'NH', nj: 'NJ', nm: 'NM', ny: 'NY', nc: 'NC', nd: 'ND',
  oh: 'OH', ok: 'OK', or: 'OR', pa: 'PA', ri: 'RI', sc: 'SC', sd: 'SD',
  tn: 'TN', tx: 'TX', ut: 'UT', vt: 'VT', va: 'VA', wa: 'WA', wv: 'WV',
  wi: 'WI', wy: 'WY'
};

export function slugToTitle(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

