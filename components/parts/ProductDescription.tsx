import type { ReactNode } from 'react';
import { sanitizeCustomerFacingCopy } from '@/lib/parts/displayBrand';

const SPEC_SHEET_LINE =
  /^Full technical specification sheet:\s*(https?:\/\/\S+)$/i;

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function isUrl(text: string): boolean {
  return /^https?:\/\//.test(text);
}

function linkifyText(text: string, keyPrefix: string) {
  const parts = text.split(URL_PATTERN);
  const body: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (!part) return;

    if (isUrl(part)) {
      body.push(
        <a
          key={`${keyPrefix}-url-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-canyon-rust underline decoration-canyon-rust/40 underline-offset-2 hover:decoration-canyon-rust"
        >
          {part}
        </a>,
      );
      return;
    }

    body.push(part);
  });

  return body;
}

type ProductDescriptionProps = {
  description?: string | null;
  specPdfUrl?: string | null;
};

export default function ProductDescription({
  description,
  specPdfUrl,
}: ProductDescriptionProps) {
  if (!description?.trim()) return null;

  const clean = sanitizeCustomerFacingCopy(description);
  const paragraphs = clean.split(/\n\n+/).filter(Boolean);
  let resolvedSpecUrl = specPdfUrl?.trim() || null;
  const body: ReactNode[] = [];

  paragraphs.forEach((paragraph, index) => {
    const specMatch = paragraph.match(SPEC_SHEET_LINE);
    if (specMatch) {
      resolvedSpecUrl = resolvedSpecUrl ?? specMatch[1];
      return;
    }

    body.push(
      <p key={`desc-${index}`} className="whitespace-pre-line">
        {linkifyText(paragraph, `desc-${index}`)}
      </p>,
    );
  });

  return (
    <div className="mb-6 space-y-4 text-gray-700">
      {body}
      {resolvedSpecUrl ? (
        <p>
          <a
            href={resolvedSpecUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-lg border border-canyon-rust/25 bg-orange-50 px-4 py-2 text-sm font-semibold text-canyon-rust transition hover:border-canyon-rust/50 hover:bg-orange-100"
          >
            Download technical specification sheet (PDF) →
          </a>
        </p>
      ) : null}
    </div>
  );
}
