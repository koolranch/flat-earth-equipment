'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

type Props = {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  testIds?: { primary?: string; secondary?: string };
};

export default function CTAButtons({
  primaryHref,
  primaryLabel = 'Resume training',
  secondaryHref,
  secondaryLabel = 'View details',
  testIds
}: Props) {
  const router = useRouter();

  const onPrimary = useCallback((e: React.MouseEvent) => {
    if (!primaryHref) return;
    // If any parent called preventDefault, force nav as a fallback
    setTimeout(() => {
      // If we haven't navigated by now, push
      router.push(primaryHref);
    }, 0);
  }, [primaryHref, router]);

  return (
    <div className="mt-5 flex items-center gap-3">
      {primaryHref ? (
        <Link
          href={primaryHref}
          prefetch={false}
          className="btn-primary"
          data-testid={testIds?.primary || 'resume-training'}
          onClick={onPrimary}
          aria-label={primaryLabel}
        >
          {primaryLabel}
        </Link>
      ) : (
        <button className="btn-primary opacity-50 cursor-not-allowed" aria-disabled>
          {primaryLabel}
        </button>
      )}
      {secondaryHref ? (
        <Link
          href={secondaryHref}
          prefetch={false}
          className="btn-secondary"
          data-testid={testIds?.secondary || 'view-details'}
          aria-label={secondaryLabel}
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
