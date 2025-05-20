"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function QuoteForm() {
  const searchParams = useSearchParams();
  const prefilledSku = searchParams.get("sku") || "";
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-canyon-rust mb-4">Thanks for your request!</h1>
        <p className="text-slate-600">We'll review your info and get back to you shortly.</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Request a Quote</h1>
      <form
        method="POST"
        action="https://formspree.io/f/mrbqkjke"
        onSubmit={() => setSubmitted(true)}
        className="space-y-4"
      >
        <input type="hidden" name="_subject" value="New Quote Request" />

        <input
          name="name"
          placeholder="Your Name"
          required
          autoComplete="name"
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />
        <input
          name="company"
          placeholder="Company (optional)"
          autoComplete="organization"
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone (optional)"
          autoComplete="tel"
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />

        <input
          name="equipment"
          placeholder="Make & Model (e.g. JLG 1930ES)"
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />
        <input
          name="part"
          placeholder="Part Number or Description"
          defaultValue={prefilledSku}
          required
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />
        <input
          name="qty"
          type="number"
          placeholder="Quantity (optional)"
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />

        <textarea
          name="notes"
          placeholder="Additional notes (fitment details, needed by date, etc.)"
          rows={4}
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />

        <button
          type="submit"
          className="bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition w-full"
        >
          Send Request
        </button>
      </form>
    </main>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuoteForm />
    </Suspense>
  );
} 