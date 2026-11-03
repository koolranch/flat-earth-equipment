'use client';

import Link from 'next/link';

type SmsConsentCheckboxProps = {
  id?: string;
  name?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export default function SmsConsentCheckbox({
  id = 'sms-consent',
  name = 'smsConsent',
  checked,
  onCheckedChange,
  disabled = false,
}: SmsConsentCheckboxProps) {
  const controlled = typeof checked === 'boolean';

  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        value="yes"
        checked={controlled ? checked : undefined}
        defaultChecked={controlled ? undefined : false}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
      />
      <label htmlFor={id} className="text-sm leading-snug text-slate-600">
        Yes, I agree to receive text messages from Flat Earth Equipment at the
        number provided about my quotes, orders and shipping updates. Message
        frequency varies. Msg & data rates may apply. Reply STOP to opt out,
        HELP for help. Consent is not a condition of purchase. See our{' '}
        <Link href="/privacy-policy" className="underline hover:text-slate-900">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="/terms-of-service" className="underline hover:text-slate-900">
          Terms
        </Link>
        .
      </label>
    </div>
  );
}
