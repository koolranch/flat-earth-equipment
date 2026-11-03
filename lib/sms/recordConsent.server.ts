import 'server-only';
import { supabaseService } from '@/lib/supabase/service.server';

export type SmsConsentSource = 'quote' | 'contact' | 'signup';

export function readSmsConsent(value: unknown): {
  sms_consent: boolean;
  sms_consent_at: string | null;
} {
  const sms_consent =
    value === true || value === 'true' || value === 'on' || value === 'yes';
  return {
    sms_consent,
    sms_consent_at: sms_consent ? new Date().toISOString() : null,
  };
}

/** Best-effort audit row. A failure here must not block the form submission. */
export async function recordSmsConsent(input: {
  source: SmsConsentSource;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  sms_consent: boolean;
  sms_consent_at: string | null;
  user_id?: string | null;
}): Promise<void> {
  try {
    const svc = supabaseService();
    const { error } = await svc.from('sms_consents').insert({
      source: input.source,
      name: input.name || null,
      email: input.email || null,
      phone: input.phone || null,
      sms_consent: input.sms_consent,
      sms_consent_at: input.sms_consent_at,
      user_id: input.user_id || null,
    });
    if (error) console.error('sms consent save failed', error.message);
  } catch (err) {
    console.error('sms consent save failed', err);
  }
}
