export function buildPracticalEvalInviteDeepLink(token: string) {
  return `forklift-certified:///invite/practical-eval/${encodeURIComponent(token)}`;
}
