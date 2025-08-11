"use client";

import { useState } from "react";
import QuoteModal from "./QuoteModal";

export default function QuoteButton({
  product,
}: {
  product: { name: string; slug: string; sku?: string | null };
}) {
  const [open, setOpen] = useState(false);

  async function submit(payload: any) {
    const res = await fetch("/api/quote-charger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Quote submit failed", await res.text());
      alert("There was an issue submitting your request. Please try again.");
      return;
    }
    alert("Thanks! We’ll get back to you shortly.");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
      >
        Quote
      </button>
      <QuoteModal open={open} onClose={() => setOpen(false)} onSubmit={submit} product={product} />
    </>
  );
}


