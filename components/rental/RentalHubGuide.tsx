import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  describeRentalSummary,
  getRentalHubGuide,
  getRentalHubKey,
  summarizeRentals,
  type RentalSummaryRow,
} from '@/lib/rentals/hubGuides';

type Props = {
  category: string;
  rentals: RentalSummaryRow[];
};

export default function RentalHubGuide({ category, rentals }: Props) {
  const guide = getRentalHubGuide(category);
  const summaryLine = describeRentalSummary(
    summarizeRentals(rentals),
    getRentalHubKey(category),
  );
  const quoteHref = `/quote?equipment=${encodeURIComponent(category)}`;

  return (
    <section
      aria-labelledby="rental-hub-guide-heading"
      className="mt-20 border-t border-slate-200 pt-12"
    >
      <div className="max-w-3xl">
        <h2
          id="rental-hub-guide-heading"
          className="mb-4 text-2xl font-bold text-slate-900"
        >
          {guide.heading}
        </h2>
        <p className="text-slate-600">{guide.intro}</p>
        {summaryLine && <p className="mt-3 text-sm text-slate-500">{summaryLine}</p>}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            {guide.checklistHeading}
          </h3>
          <dl className="space-y-4">
            {guide.checklist.map((item) => (
              <div key={item.title} className="border-l-2 border-slate-200 pl-4">
                <dt className="font-semibold text-slate-900">{item.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">{guide.partsHeading}</h3>
          <p className="mt-1 mb-4 text-sm text-slate-600">{guide.partsIntro}</p>
          <ul className="divide-y divide-slate-200">
            {guide.parts.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-start justify-between gap-3 py-3 text-sm"
                >
                  <span>
                    <span className="block font-semibold text-slate-900 group-hover:text-canyon-rust">
                      {link.label}
                    </span>
                    <span className="block text-slate-500">{link.description}</span>
                  </span>
                  <ArrowRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-canyon-rust"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
          {guide.showForkliftTraining && (
            <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
              Operators need forklift certification?{' '}
              <Link
                href="/safety"
                className="font-semibold text-canyon-rust hover:underline"
              >
                Train online or in the app →
              </Link>
            </p>
          )}
        </aside>
      </div>

      <div className="mt-12 max-w-3xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Common questions</h3>
        <dl className="space-y-5">
          {guide.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-slate-900">{faq.question}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href={quoteHref}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-canyon-rust px-6 py-3 font-semibold text-white transition-colors hover:bg-canyon-rust/90"
        >
          Request a quote
        </Link>
        <a
          href="tel:+1-888-392-9175"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Call (888) 392-9175
        </a>
      </div>
    </section>
  );
}
