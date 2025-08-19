"use client";

import { useState } from "react";
import SimpleQuoteModal from "./SimpleQuoteModal";

export default function QuoteButton({
  product,
}: {
  product: { name: string; slug: string; sku?: string | null };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
      >
        Quote
      </button>
      <SimpleQuoteModal 
        open={open} 
        onClose={() => setOpen(false)} 
        product={product} 
      />
    </>
  );
}


