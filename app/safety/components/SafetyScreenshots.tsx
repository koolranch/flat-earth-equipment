import ScreenshotCard from './ScreenshotCard';

const SUPABASE_STORAGE_URL = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets';

export default function SafetyScreenshots() {
  return (
    <section aria-labelledby="proof-heading" className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white -z-10" />
      
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold text-orange-600 tracking-wide uppercase mb-3">Product Preview</p>
        <h2 id="proof-heading" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">See exactly what you get</h2>
        <p className="mt-3 text-slate-600 max-w-xl mx-auto">Dashboard, interactive modules, and instant certificate — all OSHA-aligned, mobile-friendly, and built for speed.</p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-6 lg:gap-8">
        {/* 1) Dashboard - spans full width on md, crops from center-top to hide excess nav */}
        <div className="md:col-span-2">
          <ScreenshotCard
            src={`${SUPABASE_STORAGE_URL}/safety-dashboard.jpg`}
            alt="Training dashboard showing 5 modules with progress tracking and final exam"
            caption="<span class='font-semibold'>Training Dashboard</span> — Track your progress across all 5 modules and unlock the final exam."
            badge="5 Modules"
            badgeColor="orange"
            objectPosition="center 15%"
          />
        </div>

        {/* 2) Interactive Module - crops from top to focus on the flash card */}
        <ScreenshotCard
          src={`${SUPABASE_STORAGE_URL}/safety-module.jpg`}
          alt="Interactive flash card module with tap-to-reveal quiz format"
          caption="<span class='font-semibold'>Interactive Flash Cards</span> — Tap to reveal answers. No boring slides."
          badge="Interactive"
          badgeColor="blue"
          objectPosition="center 55%"
        />

        {/* 3) Certificate - crops from center to hide the black bars */}
        <ScreenshotCard
          src={`${SUPABASE_STORAGE_URL}/safety-certificate.jpg`}
          alt="Exam passed screen showing 100% score with Download Certificate and Wallet Card buttons"
          caption="<span class='font-semibold'>Instant Certificate</span> — Download your PDF + wallet card immediately."
          badge="Instant Download"
          badgeColor="emerald"
          objectPosition="center 70%"
        />
      </div>
    </section>
  );
}
