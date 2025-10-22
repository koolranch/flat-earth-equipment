"use client";
import Link from "next/link";
import DemoVideo from "@/components/DemoVideo";

export default function HeroCTAs() {
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3 justify-center">
        <Link
          data-cta="start"
          href="/safety/forklift"
          className="inline-flex items-center rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 transition-colors shadow-lg"
        >
          Start Certificate — $59
        </Link>
        <a
          data-cta="demo"
          href="#demo"
          className="inline-flex items-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
        >
          Watch 20-sec Demo
        </a>
      </div>
      <div id="demo" className="flex justify-center">
        <DemoVideo poster="/media/demo/poster.jpg" />
      </div>
    </>
  );
}

