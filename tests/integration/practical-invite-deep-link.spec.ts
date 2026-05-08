import { expect, test } from '@playwright/test';
import { buildPracticalEvalInviteDeepLink } from '../../lib/practical/deepLink';

test.describe('practical evaluation invite deep links', () => {
  test('builds a route-compatible app deep link for generated invites', () => {
    const token = 'eval_invite_ABC-123';

    expect(buildPracticalEvalInviteDeepLink(token)).toBe(
      'forklift-certified:///invite/practical-eval/eval_invite_ABC-123',
    );
  });

  test('keeps the practical evaluation path distinct from generic team invites', () => {
    const deepLink = buildPracticalEvalInviteDeepLink('TEAM-123');
    const url = new URL(deepLink);

    expect(url.protocol).toBe('forklift-certified:');
    expect(url.pathname).toBe('/invite/practical-eval/TEAM-123');
    expect(url.pathname).not.toMatch(/^\/invite\/[A-Z0-9-]+$/i);
  });
});
