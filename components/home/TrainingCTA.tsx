import Link from 'next/link';

export default function TrainingCTA() {
  return (
    <section className="bg-gradient-to-br from-[#F76511] via-orange-600 to-orange-700 py-16 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
          <span>🎓</span> OSHA-Compliant Training
        </div>

        <h2 className="mb-4 text-4xl font-bold md:text-5xl">Get Forklift Certified Online</h2>

        <p className="mx-auto mb-8 max-w-2xl text-xl text-white/95">
          Interactive training with hands-on demos, micro-quizzes, and QR-verifiable certificates.
          Meet OSHA 29 CFR 1910.178 requirements in hours, not days.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/safety"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-[#F76511] shadow-xl transition-all hover:bg-orange-50 hover:shadow-2xl"
          >
            Start Training →
          </Link>
          <Link
            href="/safety#pricing"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur transition-all hover:bg-white/20"
          >
            See Pricing
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/90">
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span>No long videos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span>Interactive demos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span>Instant certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span>English & Spanish</span>
          </div>
        </div>
      </div>
    </section>
  );
}
