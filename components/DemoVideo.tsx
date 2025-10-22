"use client";
import { useState } from "react";

type Props = { poster?: string };

export default function DemoVideo({ poster = "/media/demo/poster.jpg" }: Props) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="mt-4">
      {/* Desktop: inline video */}
      <video
        className="hidden md:block w-full max-w-xl rounded-xl border border-gray-200 shadow-sm"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
      >
        <source src="/media/demo/hero-demo.webm" type="video/webm" />
        <source src="/media/demo/hero-demo.mp4" type="video/mp4" />
      </video>

      {/* Mobile: poster -> modal */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden block w-full max-w-md overflow-hidden rounded-xl border border-gray-200"
        aria-label="Watch 20-second demo"
      >
        <img
          src={poster}
          alt="Forklift training demo (poster)"
          className="w-full"
          loading="lazy"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          role="button"
          tabIndex={-1}
        >
          <button
            type="button"
            className="max-w-md w-full text-left"
            onClick={(e) => e.stopPropagation()}
            aria-label="Video player"
          >
            <div role="dialog" aria-modal="true">
              <video className="w-full rounded-xl" autoPlay controls playsInline>
                <source src="/media/demo/hero-demo.webm" type="video/webm" />
                <source src="/media/demo/hero-demo.mp4" type="video/mp4" />
              </video>
              <button
                type="button"
                className="mt-3 w-full rounded-lg bg-white px-4 py-2 font-semibold"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

