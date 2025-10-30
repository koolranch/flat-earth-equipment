import ScreenshotCard from './ScreenshotCard';

const SUPABASE_STORAGE_URL = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets';

export default function SafetyScreenshots() {
  return (
    <section aria-labelledby="proof-heading" className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="proof-heading" className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">See exactly what you get</h2>
        <p className="mt-3 text-slate-600">Dashboard → Interactive module → Instant certificate. OSHA-aligned, mobile-friendly, and fast.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* 1) Dashboard */}
        <ScreenshotCard
          src={`${SUPABASE_STORAGE_URL}/safety-dashboard.jpg`}
          alt="Training dashboard showing modules and progress"
          caption="Your training dashboard: track progress and unlock the final exam."
          aspect="4/3"
        />

        {/* 2) Interactive Module */}
        <ScreenshotCard
          src={`${SUPABASE_STORAGE_URL}/safety-module.jpg`}
          alt="Interactive flashcard module with reveal answer and quiz buttons"
          caption="Interactive OSHA training with flash cards and quizzes — not boring slides."
          aspect="4/3"
        />

        {/* 3) Certificate */}
        <div className="md:col-span-2">
          <ScreenshotCard
            src={`${SUPABASE_STORAGE_URL}/safety-certificate.jpg`}
            alt="Exam passed screen with Download Certificate and Wallet Card buttons"
            caption="Pass your exam and download your official certificate instantly."
            aspect="16/9"
          />
        </div>
      </div>
    </section>
  );
}

