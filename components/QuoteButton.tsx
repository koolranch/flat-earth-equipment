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
        className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
        title="Request quote for bulk orders and purchase orders"
      >
        Get Quote
      </button>
      <SimpleQuoteModal 
        open={open} 
        onClose={() => setOpen(false)} 
        product={product} 
      />
    </>
  );
}


