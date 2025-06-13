import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quote Request Received | Flat Earth Equipment",
  description: "Thank you for your quote request. We'll get back to you within one hour.",
};

export default function QuoteThankYouPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Quote Request Received!</h1>
      <p className="text-slate-600 mb-8">
        We're working on your quote and will get back to you within one hour during business hours.
      </p>
      <div className="space-y-4">
        <p className="text-slate-700">
          While you wait, you can:
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/parts"
            className="bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
          >
            Browse Parts
          </Link>
          <Link
            href="/training"
            className="bg-white text-canyon-rust border border-canyon-rust px-6 py-3 rounded-md hover:bg-orange-50 transition"
          >
            View Training
          </Link>
        </div>
      </div>
    </main>
  );
} 