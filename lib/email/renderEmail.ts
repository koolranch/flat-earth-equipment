/**
 * lib/email/renderEmail.ts
 *
 * Thin wrapper around @react-email/render that converts a React Email
 * component to an HTML string suitable for passing to sendMail().
 *
 * Kept as a separate file (not inside mailer.ts) so we can import it
 * from API routes without the react-email JSX transform leaking into
 * server-action / route files.
 */

import { render } from '@react-email/render';
import type { ReactElement } from 'react';

/**
 * Render a React Email component to an HTML string.
 * This is the async variant; @react-email/render v1+ supports it natively.
 */
export async function renderEmailHtml(element: ReactElement): Promise<string> {
  return render(element);
}
