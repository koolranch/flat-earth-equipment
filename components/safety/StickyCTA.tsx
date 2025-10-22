"use client";
import Link from "next/link";

export default function StickyCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-3 md:hidden">
      <div className="flex items-center">
        <Link
          href="/safety/forklift"
          className="w-full inline-flex justify-center rounded-lg bg-orange-600 px-4 py-3 text-white font-semibold hover:bg-orange-700 transition-colors"
        >
          Start — $59
        </Link>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
