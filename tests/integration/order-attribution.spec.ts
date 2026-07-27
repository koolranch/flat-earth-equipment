/**
 * Google Ads → orders attribution helpers.
 * Run: npx playwright test tests/integration/order-attribution.spec.ts
 */

import { expect, test } from '@playwright/test';
import {
  attributionFieldsFromCheckoutMetadata,
  hasGoogleClickId,
  pickClickIdsFromRecord,
} from '@/lib/attribution/orderAttribution';
import { mergeClickIds, parseGclAwCookie } from '@/lib/attribution/mergeClickIds';

test.describe('attributionFieldsFromCheckoutMetadata', () => {
  test('copies click ids + funnel_state from Stripe metadata', () => {
    const fields = attributionFieldsFromCheckoutMetadata({
      gclid: 'Cj0KCQjw_test',
      gbraid: 'GBRAID_1',
      wbraid: ' WBRAID_1 ',
      funnel_state: 'OH',
      course_slug: 'forklift',
    });
    expect(fields).toEqual({
      gclid: 'Cj0KCQjw_test',
      gbraid: 'GBRAID_1',
      wbraid: 'WBRAID_1',
      funnel_state: 'oh',
    });
    expect(hasGoogleClickId(fields)).toBe(true);
  });

  test('returns nulls when metadata missing (organic / SEO)', () => {
    const fields = attributionFieldsFromCheckoutMetadata({
      course_slug: 'forklift',
      price_id: 'price_abc',
    });
    expect(fields).toEqual({
      gclid: null,
      gbraid: null,
      wbraid: null,
      funnel_state: null,
    });
    expect(hasGoogleClickId(fields)).toBe(false);
  });

  test('handles undefined metadata', () => {
    expect(attributionFieldsFromCheckoutMetadata(undefined)).toEqual({
      gclid: null,
      gbraid: null,
      wbraid: null,
      funnel_state: null,
    });
  });
});

test.describe('click id merge helpers', () => {
  test('parseGclAwCookie extracts gclid', () => {
    expect(parseGclAwCookie('GCL.1710000000.Cj0KCQjw_abc')).toBe('Cj0KCQjw_abc');
    expect(parseGclAwCookie('')).toBeUndefined();
  });

  test('mergeClickIds prefers incoming URL values, keeps stored otherwise', () => {
    expect(
      mergeClickIds({ gclid: 'NEW' }, { gclid: 'OLD', gbraid: 'KEEP' }),
    ).toEqual({ gclid: 'NEW', gbraid: 'KEEP' });
  });

  test('pickClickIdsFromRecord strips empties', () => {
    expect(
      pickClickIdsFromRecord({ gclid: 'x', gbraid: '', wbraid: '  ', other: 1 }),
    ).toEqual({ gclid: 'x' });
  });
});
