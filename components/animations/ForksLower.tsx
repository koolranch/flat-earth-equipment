/* eslint-disable react/no-danger */
"use client";
import React from "react";

function stripSmil(svg: string) {
  return svg
    .replace(/<animate[\s\S]*?<\/animate>/gi, "")
    .replace(/<animateTransform[\s\S]*?<\/animateTransform>/gi, "")
    .replace(/<animateMotion[\s\S]*?<\/animateMotion>/gi, "");
}

export default function ForksLower({ className }: { className?: string }) {
  const [markup, setMarkup] = React.useState<string>("");

  React.useEffect(() => {
    let cancelled = false;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    async function load() {
      const res = await fetch("/training/animations/d3-forks-lower.svg", { cache: "force-cache" });
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
      aria-label="Forks lowering animation"
      role="img"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
