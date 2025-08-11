"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  product: { name: string; slug: string; sku?: string | null };
};

export default function QuoteModal({ open, onClose, onSubmit, product }: Props) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!open) return null;

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    await onSubmit({
      ...payload,
      product_name: product.name,
      product_slug: product.slug,
      product_sku: product.sku ?? "",
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Request a Quote</h2>
          <p className="text-sm text-neutral-600">{product.name}</p>
        </div>

        <form className="space-y-3" onSubmit={handle}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span>Name</span>
              <input name="name" required className="rounded-xl border p-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Email</span>
              <input type="email" name="email" required className="rounded-xl border p-2" />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span>Company</span>
              <input name="company" className="rounded-xl border p-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Phone</span>
              <input name="phone" className="rounded-xl border p-2" />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span>Quantity</span>
              <input name="quantity" defaultValue="1" className="rounded-xl border p-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Urgency</span>
              <select name="urgency" className="rounded-xl border p-2">
                <option>Soon</option>
                <option>This Week</option>
                <option>Researching</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span>Notes</span>
            <textarea name="notes" rows={3} className="rounded-xl border p-2" />
          </label>

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border px-3 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


