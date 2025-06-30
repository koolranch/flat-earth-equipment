import React, { useState, FormEvent } from 'react';

interface FastQuoteFormProps {
  currentLocation?: string;
}

export default function FastQuoteForm({ currentLocation = '' }: FastQuoteFormProps) {
  const [quoteType, setQuoteType] = useState<'parts' | 'rental'>('parts');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    email: '',
    make: '',
    model: '',
    partNumber: '',
    equipmentType: 'Forklift',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('https://api.usebasin.com/v1/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BASIN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quoteType,
          location: currentLocation,
          subject: 'Fast Quote Request',
          form_name: 'fast_quote'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({
          email: '',
          make: '',
          model: '',
          partNumber: '',
          equipmentType: 'Forklift',
          startDate: '',
          endDate: ''
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (status === 'success') {
    return (
      <section aria-labelledby="fast-quote-heading" className="max-w-xl mx-auto p-6 bg-white shadow rounded text-center">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">✅ Quote Request Received!</h2>
        <p className="text-gray-700 mb-4">We'll get back to you within 1 hour.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-canyon-rust underline"
        >
          Submit another request
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="fast-quote-heading" className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 id="fast-quote-heading" className="text-2xl font-semibold mb-2">
        Need a Fast Quote?
      </h2>
      <p className="mb-4 text-gray-700">
        Parts or equipment rental—with a reply in under 1 hour.
      </p>
      
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Failed to send request. Please try again.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="font-medium">I need a quote for:</span>
          <select
            name="quoteType"
            value={quoteType}
            onChange={(e) => setQuoteType(e.target.value as 'parts' | 'rental')}
            disabled={status === 'loading'}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
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
                value={formData.make}
                onChange={handleChange}
                required 
                disabled={status === 'loading'}
                autoComplete="organization"
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50" 
              />
            </label>
            <label className="block">
              <span className="font-medium">Model (e.g., 8FGCU25):</span>
              <input 
                type="text" 
                name="model" 
                value={formData.model}
                onChange={handleChange}
                required 
                disabled={status === 'loading'}
                autoComplete="off"
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50" 
              />
            </label>
            <label className="block">
              <span className="font-medium">Part Number or Description:</span>
              <input 
                type="text" 
                name="partNumber" 
                value={formData.partNumber}
                onChange={handleChange}
                required 
                disabled={status === 'loading'}
                autoComplete="off"
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50" 
              />
            </label>
          </>
        ) : (
          <>
            <label className="block">
              <span className="font-medium">Equipment Type:</span>
              <select 
                name="equipmentType" 
                value={formData.equipmentType}
                onChange={handleChange}
                required 
                disabled={status === 'loading'}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
              >
                <option>Forklift</option>
                <option>Scissor Lift</option>
                <option>Telehandler</option>
                <option>Attachment</option>
              </select>
            </label>
            <label className="block">
              <span className="font-medium">Start Date:</span>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate}
                onChange={handleChange}
                required 
                disabled={status === 'loading'}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50" 
              />
            </label>
            <label className="block">
              <span className="font-medium">End Date:</span>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate}
                onChange={handleChange}
                required 
                disabled={status === 'loading'}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50" 
              />
            </label>
          </>
        )}

        <label className="block">
          <span className="font-medium">Email Address:</span>
          <input 
            type="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            required 
            disabled={status === 'loading'}
            autoComplete="email"
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50" 
          />
        </label>

        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full bg-canyon-rust text-white font-semibold rounded px-4 py-2 hover:bg-orange-700 transition disabled:opacity-50"
        >
          {status === 'loading' ? 'Sending...' : 'Request a Fast Quote'}
        </button>

        <p className="mt-2 text-sm text-gray-500">
          🚚 Same-day dispatch • 📦 Shipped Nationwide • 🤠 Western U.S. Focus
        </p>
      </form>
    </section>
  );
} 