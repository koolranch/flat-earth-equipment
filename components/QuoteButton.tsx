"use client";

import { useState } from "react";
import SimpleQuoteModal from "./SimpleQuoteModal";

export default function QuoteButton({
  product,
  variant = "dark"
}: {
  product: { name: string; slug: string; sku?: string | null };
  variant?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);

  const buttonClasses = variant === "light" 
    ? "rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-100 transition-colors shadow-lg"
    : "rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={buttonClasses}
        title="Request quote for bulk orders and purchase orders"
      >
        Request Corporate Quote
      </button>
      <SimpleQuoteModal 
        open={open} 
        onClose={() => setOpen(false)} 
        product={product} 
      />
    </>
  );
}


