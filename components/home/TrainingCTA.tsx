import Link from 'next/link';

export default function TrainingCTA() {
  return (
    <section
      aria-labelledby="training-cta-heading"
      className="relative overflow-hidden bg-slate-950 py-20 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(ellipse_at_top_right,_rgba(247,101,17,0.22),_transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
          OSHA-Compliant Training
        </div>

        <h2
          id="training-cta-heading"
          className="mb-5 text-4xl font-bold leading-tight md:text-5xl"
        >
          Forklift certification, finished in one shift.
        </h2>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 md:text-xl">
          Interactive modules, hands-on demos, and QR-verifiable certificates that meet OSHA 29 CFR
          1910.178 requirements—no all-day classroom, no shipping waits.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/safety"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-canyon-rust px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
          >
            Start Training →
          </Link>
          <Link
            href="/safety#pricing"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/0 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/40 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
          >
            See Pricing
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <CheckIcon /> No long videos
          </span>
          <span className="flex items-center gap-2">
            <CheckIcon /> Interactive demos
          </span>
          <span className="flex items-center gap-2">
            <CheckIcon /> Instant certificate
          </span>
          <span className="flex items-center gap-2">
            <CheckIcon /> English &amp; Spanish
          </span>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-emerald-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}
