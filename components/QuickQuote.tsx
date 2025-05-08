'use client';

import { useState } from 'react';

export default function QuickQuote() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Replace with actual form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="bg-slate-50 border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 rounded-md shadow-sm max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">Quote Request Received!</h2>
          <p className="text-slate-600">
            We'll get back to you within 1 hour with your quote.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 rounded-md shadow-sm max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center text-slate-800">
        Need a Fast Quote?
      </h2>
      <p className="text-slate-600 text-center mb-8">
        We'll get back to you within 1 hour — no fluff, just parts.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-slate-700 mb-1">
              Make
            </label>
            <input
              type="text"
              id="make"
              name="make"
              required
              className="w-full border border-slate-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent"
              placeholder="e.g., Toyota"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-slate-700 mb-1">
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              required
              className="w-full border border-slate-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent"
              placeholder="e.g., 8FGCU25"
            />
          </div>
        </div>

        <div>
          <label htmlFor="part" className="block text-sm font-medium text-slate-700 mb-1">
            Part Number or Description
          </label>
          <input
            type="text"
            id="part"
            name="part"
            required
            className="w-full border border-slate-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent"
            placeholder="e.g., 12345-67890 or 'hydraulic pump'"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full border border-slate-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#A0522D] text-white px-6 py-3 rounded-md hover:bg-[#8B4513] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Request a Fast Quote'}
          </button>
        </div>
      </form>
    </section>
  );
} 