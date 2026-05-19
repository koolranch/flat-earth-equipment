export type SafetyTrafficSource = 'ad' | 'organic';

export type SafetySearchParams = Record<string, string | string[] | undefined>;
export type SafetyCookieMap = Record<string, string | undefined>;

interface DetectSafetyTrafficSourceArgs {
  searchParams?: SafetySearchParams;
  cookies?: SafetyCookieMap;
}

function firstParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function normalizedParam(params: SafetySearchParams | undefined, key: string): string {
  return firstParamValue(params?.[key]).trim().toLowerCase();
}

function hasParam(params: SafetySearchParams | undefined, key: string): boolean {
  return firstParamValue(params?.[key]).trim().length > 0;
}

function isGoogleAdsUtm(params: SafetySearchParams | undefined): boolean {
  const source = normalizedParam(params, 'utm_source');
  const medium = normalizedParam(params, 'utm_medium');

  if (!['google', 'googleads', 'google_ads'].includes(source)) return false;

  return ['cpc', 'ppc', 'paid', 'paid_search', 'sem'].includes(medium);
}

export function detectSafetyTrafficSource({
  searchParams,
  cookies = {},
}: DetectSafetyTrafficSourceArgs): SafetyTrafficSource {
  if (hasParam(searchParams, 'gclid')) return 'ad';
  if (isGoogleAdsUtm(searchParams)) return 'ad';
  if ((cookies._gcl_aw || '').trim()) return 'ad';

  return 'organic';
}
