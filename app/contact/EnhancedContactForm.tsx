"use client";
import { useState } from "react";

export default function EnhancedContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zipcode: '',
    reason: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', zipcode: '', reason: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-green-700 mb-2">Message Sent!</h3>
        <p className="text-green-600 mb-4">We'll get back to you within 24 hours.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-green-700 underline hover:text-green-800"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Failed to send message. Please try again or email us directly at contact@flatearthequipment.com
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required
            value={formData.name}
            onChange={handleChange}
            disabled={status === 'loading'}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors disabled:opacity-50"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required
            value={formData.email}
            onChange={handleChange}
            disabled={status === 'loading'}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors disabled:opacity-50"
            placeholder="john@company.com"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={status === 'loading'}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors disabled:opacity-50"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label htmlFor="zipcode" className="block text-sm font-medium text-slate-700 mb-2">Project Location (Zip Code)</label>
          <input 
            type="text" 
            id="zipcode" 
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            disabled={status === 'loading'}
            pattern="[0-9]{5}"
            maxLength={5}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors disabled:opacity-50"
            placeholder="82801"
          />
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">Reason for Inquiry *</label>
        <select 
          id="reason" 
          name="reason" 
          required
          value={formData.reason}
          onChange={handleChange}
          disabled={status === 'loading'}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white disabled:opacity-50"
        >
          <option value="">Select a reason...</option>
          <option value="Rental Quote">Rental Quote</option>
          <option value="Service Request">Service Request</option>
          <option value="Training Support">Training Support</option>
          <option value="General Question">General Question</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message *</label>
        <textarea 
          id="message" 
          name="message" 
          rows={5}
          required
          value={formData.message}
          onChange={handleChange}
          disabled={status === 'loading'}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none disabled:opacity-50"
          placeholder="Tell us about your project or question..."
        />
      </div>

      <button 
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
