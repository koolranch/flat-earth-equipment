/**
 * Pure (side-effect-free) helpers for the validate-code route.
 * Kept here so Playwright integration tests can import and exercise them
 * without spinning up a Next.js server.
 */

export interface InviteRow {
  id: string;
  status: string;
  claimed_at: string | null;
  claimed_by: string | null;
  expires_at: string | null;
  email: string;
  course_id: string;
  order_id: string | null;
  created_by: string;
}

export type ValidateErrorCode =
  | 'unauthorized'
  | 'rate_limited'
  | 'not_found'
  | 'revoked'
  | 'claimed'
  | 'expired'
  | 'email_mismatch'
  | 'no_seats_available'
  | 'internal';

export interface ValidateError {
  valid: false;
  errorCode: ValidateErrorCode;
  error: string;
}

export interface ValidateSuccess {
  valid: true;
  orgName: string | null;
  claimedSeatInviteId: string;
}

export type ValidateResult = ValidateError | ValidateSuccess;

/**
 * Normalise a raw code entered by the user:
 * strip all internal whitespace, uppercase, trim.
 */
export function normalizeCode(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase();
}

/**
 * Validate an invite row against the current user and time.
 * Returns null on success, or an error payload on failure.
 *
 * @param invite  The row fetched from seat_invites
 * @param userId  The currently authenticated user's id
 * @param userEmail  The authenticated user's email (lower-cased)
 * @param now    Current timestamp (injectable for testing)
 */
export function checkInvite(
  invite: InviteRow,
  userId: string,
  userEmail: string,
  now: Date = new Date(),
): ValidateError | null {
  // 1. Revoked
  if (invite.status === 'revoked') {
    return {
      valid: false,
      errorCode: 'revoked',
      error: 'This code was revoked. Contact your employer.',
    };
  }

  // 2. Already claimed — idempotency guard first
  if (invite.claimed_at !== null) {
    if (invite.claimed_by === userId) {
      // Same user claiming again — treat as idempotent success
      return null;
    }
    return {
      valid: false,
      errorCode: 'claimed',
      error: 'This code has already been used.',
    };
  }

  // 3. Expired
  if (invite.expires_at !== null && new Date(invite.expires_at) < now) {
    return {
      valid: false,
      errorCode: 'expired',
      error: 'This code has expired. Contact your employer.',
    };
  }

  // 4. Email mismatch — only enforce when invite has a pinned email
  if (invite.email && invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    return {
      valid: false,
      errorCode: 'email_mismatch',
      error: 'This code was issued to a different email.',
    };
  }

  return null; // all checks passed
}

/**
 * Returns true when the invite has already been claimed by this exact user
 * and we should short-circuit with an idempotent success response.
 */
export function isIdempotentReclaim(invite: InviteRow, userId: string): boolean {
  return invite.claimed_at !== null && invite.claimed_by === userId;
}
