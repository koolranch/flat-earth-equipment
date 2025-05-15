'use client';

import { useState } from 'react';
import FastQuoteForm from '@/components/FastQuoteForm';

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
    <section className="bg-slate-50 border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center text-slate-800">
        Need a Fast Quote?
      </h2>
      <p className="text-slate-600 text-center mb-8">
        We'll get back to you within 1 hour — no fluff, just parts.
      </p>

      <FastQuoteForm currentLocation="{yourLocationSlug}" />
    </section>
  );
} 