"use client";
import { useEffect, useState } from "react";

// tiny inline SVG fallback so we always show something
const FALLBACK_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
  <stop offset='0' stop-color='#FFF7ED'/><stop offset='1' stop-color='#FFE4D6'/></linearGradient></defs>
  <rect width='1200' height='800' fill='url(#g)'/>
  <g font-family='Inter, system-ui, sans-serif' fill='#0F172A'>
    <text x='60' y='140' font-size='42' font-weight='800'>Forklift Certification – 20-sec Demo</text>
    <text x='60' y='210' font-size='22'>If you see this placeholder, demo media isn't shipped yet.</text>
    <text x='60' y='250' font-size='22'>Add files under /public/media/demo and redeploy.</text>
  </g>
</svg>`);

async function exists(url: string) {
  try {
    const r = await fetch(url, { method: "HEAD", cache: "no-store" });
    return r.ok;
  } catch {
    return false;
  }
}

export default function DemoVideo() {
  const [poster, setPoster] = useState<string>(FALLBACK_POSTER);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    (async () => {
      const posterUrl = "/media/demo/poster.jpg";
      const webmUrl = "/media/demo/hero-demo.webm";
      const mp4Url = "/media/demo/hero-demo.mp4";
      
      if (await exists(posterUrl)) setPoster(posterUrl);
      setHasVideo((await exists(webmUrl)) || (await exists(mp4Url)));
    })();
  }, []);

  return (
    <div className="mt-4">
      {/* Desktop: inline video if available; otherwise show poster */}
      {hasVideo ? (
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
      ) : (
        <img
          className="hidden md:block w-full max-w-xl rounded-xl border border-gray-200 shadow-sm"
          src={poster}
          alt="Forklift training demo poster"
          loading="eager"
        />
      )}

      {/* Mobile: poster; tap opens video in native UI if present */}
      <a
        href={hasVideo ? "/media/demo/hero-demo.mp4" : "#"}
        className="md:hidden block w-full max-w-md overflow-hidden rounded-xl border border-gray-200"
        aria-label="Watch 20-second demo"
      >
        <img
          src={poster}
          alt="Forklift training demo poster"
          className="w-full"
          loading="lazy"
        />
      </a>
    </div>
  );
}
