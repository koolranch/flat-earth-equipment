'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics/gtag';

type Props = {
  href: string;
  cta: 'start_training' | 'see_pricing';
  className: string;
  children: ReactNode;
};

/** Link that records which homepage certification button was used. Never blocks navigation. */
export default function TrainingCTALink({ href, cta, className, children }: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackEvent('home_training_cta_click', { cta, transport_type: 'beacon' })
      }
    >
      {children}
    </Link>
  );
}
