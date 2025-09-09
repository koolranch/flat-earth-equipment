import Link from "next/link";
import { DEFAULT_COURSE_SLUG } from "@/lib/courses";
import dynamic from "next/dynamic";

const OrientationInteractiveChips = dynamic(() => import("@/components/training/orientation/InteractiveChips"), { ssr: false });

export default function OrientationPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <header className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Orientation</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Get certified. No fluff. Learn by doing.</p>
      </header>
      
      <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700 mb-6">
        <h2 className="text-lg font-semibold">How this works</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 space-y-1">
          <li>Hands-on demos first. Short quizzes after each module.</li>
          <li>Pass the final exam. Your supervisor completes the practical evaluation.</li>
          <li>Certificates are issued instantly and saved to Records.</li>
        </ul>
      </section>
      
      <section className="mt-6">
        <OrientationInteractiveChips />
      </section>
      
      <div className="mt-6">
        <Link
          href={`/training?courseId=${encodeURIComponent(DEFAULT_COURSE_SLUG)}`}
          className="inline-flex items-center rounded-xl bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Start training
        </Link>
      </div>
    </main>
  );
}
