import React, { useState, FormEvent } from 'react';

interface FastQuoteFormProps {
  currentLocation?: string;
}

export default function FastQuoteForm({ currentLocation = '' }: FastQuoteFormProps) {
  const [quoteType, setQuoteType] = useState<'parts' | 'rental'>('parts');

  return (
    <section aria-labelledby="fast-quote-heading" className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 id="fast-quote-heading" className="text-2xl font-semibold mb-2">
        Need a Fast Quote?
      </h2>
      <p className="mb-4 text-gray-700">
        Parts or equipment rental—with a reply in under 1 hour.
      </p>
      <form action="https://usebasin.com/f/YOUR_BASIN_FORM_ID" method="POST" className="space-y-4">
        <input
          type="hidden"
          name="subject"
          value="Fast Quote Request"
        />
        <input
          type="hidden"
          name="form_name"
          value="fast_quote"
        />
        <input
          type="text"
          name="_gotcha"
          style={{ display: 'none' }}
        />
        <label className="block">
          <span className="font-medium">I need a quote for:</span>
          <select
            name="quoteType"
            value={quoteType}
            onChange={(e) => setQuoteType(e.target.value as 'parts' | 'rental')}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="parts">Parts</option>
            <option value="rental">Rental Equipment</option>
          </select>
        </label>

        {quoteType === 'parts' ? (
          <>
            <label className="block">
              <span className="font-medium">Make (e.g., Toyota):</span>
              <input 
                type="text" 
                name="make" 
                required 
                autoComplete="organization"
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" 
              />
            </label>
            <label className="block">
              <span className="font-medium">Model (e.g., 8FGCU25):</span>
              <input 
                type="text" 
                name="model" 
                required 
                autoComplete="off"
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" 
              />
            </label>
            <label className="block">
              <span className="font-medium">Part Number or Description:</span>
              <input 
                type="text" 
                name="partNumber" 
                required 
                autoComplete="off"
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" 
              />
            </label>
          </>
        ) : (
          <>
            <label className="block">
              <span className="font-medium">Equipment Type:</span>
              <select name="equipmentType" required className="mt-1 block w-full border border-gray-300 rounded px-3 py-2">
                <option>Forklift</option>
                <option>Scissor Lift</option>
                <option>Telehandler</option>
                <option>Attachment</option>
              </select>
            </label>
            <label className="block">
              <span className="font-medium">Start Date:</span>
              <input type="date" name="startDate" required className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
            </label>
            <label className="block">
              <span className="font-medium">End Date:</span>
              <input type="date" name="endDate" required className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" />
            </label>
            <input type="hidden" name="location" value={currentLocation} />
          </>
        )}

        <label className="block">
          <span className="font-medium">Email Address:</span>
          <input 
            type="email" 
            name="email" 
            required 
            autoComplete="email"
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" 
          />
        </label>

        <button type="submit" className="w-full bg-canyon-rust text-white font-semibold rounded px-4 py-2 hover:bg-orange-700 transition">
          Request a Fast Quote
        </button>

        <p className="mt-2 text-sm text-gray-500">
          🚚 Same-day dispatch • 📦 Shipped Nationwide • 🤠 Western U.S. Focus
        </p>
      </form>
    </section>
  );
} 