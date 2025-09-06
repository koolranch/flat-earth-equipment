"use client";
import React from "react";

function stripSmil(svg: string) {
  // Remove <animate>, <animateTransform>, <animateMotion> for reduced-motion users
  return svg
    .replace(/<animate[\s\S]*?<\/animate>/gi, "")
    .replace(/<animateTransform[\s\S]*?<\/animateTransform>/gi, "")
    .replace(/<animateMotion[\s\S]*?<\/animateMotion>/gi, "");
}

export default function StabilityTriangleCOG({ className }: { className?: string }) {
  const [markup, setMarkup] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    async function load() {
      const res = await fetch("/training/animations/d5-stability-triangle.svg", { cache: "force-cache" });
      const text = await res.text();
      const safe = mql.matches ? stripSmil(text) : text;
      if (!cancelled) setMarkup(safe);
    }

    load();
    const listener = () => setMarkup((cur) => (mql.matches ? stripSmil(cur) : cur));
    mql.addEventListener?.("change", listener);
    return () => {
      cancelled = true;
      mql.removeEventListener?.("change", listener);
    };
  }, []);

  return (
    <div
      className={className}
      aria-label="Stability triangle center of gravity animation"
      role="img"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
