/**
 * lib/training/purchaseRequestValidation.ts
 *
 * Pure, side-effect-free helpers for validating purchase-request inputs.
 * Exported so they can be unit-tested without a live server or DB.
 * No 'server-only' import — safe to use in any environment.
 */

// Practical RFC-5322 subset — rejects obvious non-emails, accepts real ones.
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/**
 * Returns true when the email's domain is in the disposable-email-domains list.
 * The caller passes the Set so this function remains pure and independently testable.
 */
export function isDisposableDomain(email: string, disposableSet: Set<string>): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return disposableSet.has(domain);
}

/**
 * Response columns the GET /my-purchase-requests endpoint is allowed to return.
 * Defined here so tests can assert against the same source of truth.
 */
export const ALLOWED_RESPONSE_COLUMNS = [
  'id',
  'employer_name',
  'employer_email',
  'status',
  'created_at',
  'resolved_at',
] as const;

export type AllowedColumn = (typeof ALLOWED_RESPONSE_COLUMNS)[number];
