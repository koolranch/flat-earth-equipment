/* eslint-disable react/jsx-no-target-blank */
"use client";
import Image from "next/image";
import HeroCTAs from "@/components/HeroCTAs";

export default function SafetyHero() {

  return (
    <section className="relative isolate overflow-hidden bg-slate-900 text-white h-[400px] sm:h-[450px]">
      {/* Background Image - Same as city pages */}
      <Image
        src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
        alt="Forklift certification training"
        fill
        className="object-cover object-center"
        priority
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-center">
          <p className="text-xs uppercase tracking-widest text-emerald-300/90">OSHA-Aligned Training</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Get Forklift Certified — $59</h1>
          <p className="mt-3 text-base sm:text-lg text-slate-300">
            100% online • ~60 minutes • Same-day wallet card • OSHA 29 CFR 1910.178(l) aligned
          </p>
          <HeroCTAs />
          <p className="mt-3 text-sm text-slate-300">Secure checkout — Apple Pay / Google Pay / Link</p>
        </div>
      </div>
    </section>
  );
}

