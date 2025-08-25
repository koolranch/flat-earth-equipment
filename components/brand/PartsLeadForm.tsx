'use client';

import React, { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics/react';

interface PartsLeadFormProps {
  brandSlug: string;
  brandName: string;
}

export default function PartsLeadForm({ brandSlug, brandName }: PartsLeadFormProps) {
  const startedAtRef = useRef<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    zip: '',
    model: '',
    serial: '',
    fault_code: '',
    notes: '',
    hp: '' // honeypot
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch('/api/leads/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          brand_slug: brandSlug, 
          startedAt: startedAtRef.current 
        })
      });
      const json = await res.json();
      
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'Submission failed');
      }
      
      setOk(true);
      // Track successful submission - only include properties with values
      const trackingData: Record<string, string> = { brand: brandSlug };
      if (form.model) trackingData.model = form.model;
      if (form.serial) trackingData.serial = form.serial;
      if (form.fault_code) trackingData.fault_code = form.fault_code;
      
      track('parts_lead_submit', trackingData);
      setForm({ email: '', name: '', phone: '', zip: '', model: '', serial: '', fault_code: '', notes: '', hp: '' });
    } catch (e: any) {
      setOk(false);
      setErr(e.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-6 bg-white rounded-lg border border-slate-200">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Request {brandName} Parts
          </h3>
          <p className="text-slate-600">
            Need a specific part? Fill out this form and we'll get back to you within 24 hours with pricing and availability.
          </p>
        </div>

        {ok && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">
              ✅ Thanks! We'll email you shortly with pricing and availability.
            </p>
          </div>
        )}

        {err && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{err}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Honeypot (hidden from users) */}
          <div className="hidden">
            <label>Company</label>
            <input 
              name="hp" 
              value={form.hp} 
              onChange={onChange} 
              autoComplete="off" 
              tabIndex={-1}
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={onChange} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <input 
                name="name" 
                value={form.name} 
                onChange={onChange} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={onChange} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ZIP Code
              </label>
              <input 
                name="zip" 
                value={form.zip} 
                onChange={onChange} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent" 
              />
            </div>
          </div>

          {/* Equipment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Model
              </label>
              <input 
                name="model" 
                value={form.model} 
                onChange={onChange} 
                placeholder="e.g., 8FGU25, SJ3219"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Serial Number
              </label>
              <input 
                name="serial" 
                value={form.serial} 
                onChange={onChange} 
                placeholder="Equipment serial number"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fault Code (optional)
            </label>
            <input 
              name="fault_code" 
              value={form.fault_code} 
              onChange={onChange} 
              placeholder="e.g., E001, A-36, 524195-3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              What parts do you need? <span className="text-red-500">*</span>
            </label>
            <textarea 
              required
              name="notes" 
              value={form.notes} 
              onChange={onChange} 
              rows={4} 
              placeholder="Describe the parts you need (e.g., hydraulic pump, brake pads, engine filter, etc.)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent" 
            />
          </div>

          <button 
            type="submit"
            disabled={submitting} 
            className="w-full px-4 py-3 bg-brand-accent text-white rounded-lg font-medium hover:bg-brand-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Sending Request...' : 'Request Parts Help'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500">
            Need immediate assistance? Call us at{' '}
            <a href="tel:+1-307-302-0043" className="text-brand-accent hover:underline">
              (307) 302-0043
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}