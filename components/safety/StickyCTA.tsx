"use client";
import Link from "next/link";

export default function StickyCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-3 md:hidden">
      <div className="flex items-center gap-3">
        <Link
          data-cta="start-sticky"
          href="/safety/forklift"
          className="flex-1 inline-flex justify-center rounded-lg bg-orange-600 px-4 py-3 text-white font-semibold hover:bg-orange-700 transition-colors"
        >
          Start — $59
        </Link>
        <a
          href="#how"
          className="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          How it works
        </a>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
