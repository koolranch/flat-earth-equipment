import React from 'react';

interface Bullet {
  text: string;
  sub?: string[];
}

export type OshaBasicsCardProps = {
  title: string;               // e.g., "OSHA 1910.178 — Pre-Operation Requirements"
  calloutTitle?: string;       // small badge title (optional)
  calloutBody?: React.ReactNode; // highlighted message body (optional)
  bullets: Bullet[];           // primary bullet list
  tip?: string;                // footnote in a subtle info box
  ctaLabel?: string;           // button label, default "Continue"
  onContinue?: () => void;     // fires when Continue is pressed
  testId?: string;             // data-testid hook
};

export default function OshaBasicsCard({
  title,
  calloutTitle,
  calloutBody,
  bullets,
  tip,
  ctaLabel = 'Continue',
  onContinue,
  testId
}: OshaBasicsCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6" data-testid={testId}>
      <h3 className="text-sm font-semibold tracking-tight text-slate-800 sm:text-base">{title}</h3>

      {calloutBody && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-slate-800">
          {calloutTitle && (
            <div className="mb-1 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-amber-800">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              {calloutTitle}
            </div>
          )}
          <div>{calloutBody}</div>
        </div>
      )}

      <ul className="mt-4 space-y-2 text-[13.5px] text-slate-800">
        {bullets.map((b, i) => (
          <li key={i} className="leading-6">
            <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[2px] rounded-full bg-slate-500" />
            {b.text}
            {b.sub && b.sub.length > 0 && (
              <ul className="mt-1 ml-5 list-disc space-y-1 text-[13px] text-slate-700">
                {b.sub.map((s, j) => <li key={j}>{s}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {tip && (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px] text-slate-700">
          {tip}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center rounded-md bg-amber-700 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {ctaLabel}
        </button>
      </div>
    </section>
  );
}
