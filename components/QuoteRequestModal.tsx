'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Package, 
  Truck, 
  AlertCircle,
  Building2,
  User,
  Mail,
  Phone,
  MessageSquare,
  Zap
} from 'lucide-react';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: {
    id?: string;
    name: string;
    sku: string;
    oemReference?: string;
    brand?: string;
  };
  machine?: {
    model: string;
    brand: string;
    serial?: string;
  } | null;
}

type UrgencyLevel = 'standard' | 'urgent' | 'emergency';

const URGENCY_OPTIONS: { value: UrgencyLevel; label: string; description: string; icon: string }[] = [
  { value: 'standard', label: 'Standard', description: '3-5 business days', icon: '📦' },
  { value: 'urgent', label: 'Urgent', description: '1-2 business days', icon: '⚡' },
  { value: 'emergency', label: 'Emergency', description: 'Same day if possible', icon: '🚨' },
];

export default function QuoteRequestModal({
  isOpen,
  onClose,
  part,
  machine,
}: QuoteRequestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    quantity: 1,
    machineSerial: machine?.serial || '',
    notes: '',
    urgency: 'standard' as UrgencyLevel,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);
      setFormData(prev => ({
        ...prev,
        machineSerial: machine?.serial || '',
      }));
    }
  }, [isOpen, machine?.serial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          partId: part.id,
          partName: part.name,
          oemReference: part.oemReference || part.sku,
          machineModel: machine?.model,
          machineBrand: machine?.brand,
          source: 'compatibility_hub',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit quote request');
      }

      setIsSuccess(true);
      
      // Close after success animation
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          quantity: 1,
          machineSerial: '',
          notes: '',
          urgency: 'standard',
        });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Success State */}
                {isSuccess ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Quote Request Submitted!</h3>
                    <p className="text-slate-600">
                      We'll get back to you within 24 hours with pricing and availability.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-canyon-rust to-orange-600 px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Dialog.Title className="text-lg font-bold text-white">
                            Request OEM Part Quote
                          </Dialog.Title>
                          <p className="text-orange-100 text-sm mt-0.5">
                            Get pricing and availability for your part
                          </p>
                        </div>
                        <button
                          onClick={onClose}
                          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Part Info Card */}
                    <div className="bg-slate-50 px-6 py-4 border-b">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Package className="w-6 h-6 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{part.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-mono rounded">
                              OEM: {part.oemReference || part.sku}
                            </span>
                            {part.brand && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                {part.brand}
                              </span>
                            )}
                          </div>
                          {machine && (
                            <p className="text-sm text-slate-500 mt-1">
                              For: {machine.brand} {machine.model}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                      {/* Error Message */}
                      {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {error}
                        </div>
                      )}

                      {/* Contact Info Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                            <User className="w-4 h-4" />
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                            <Mail className="w-4 h-4" />
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                            placeholder="john@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                            <Building2 className="w-4 h-4" />
                            Company
                          </label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                            placeholder="ACME Logistics"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                            <Phone className="w-4 h-4" />
                            Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>

                      {/* Quantity and Machine Serial */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                            <Package className="w-4 h-4" />
                            Quantity
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                            <Truck className="w-4 h-4" />
                            Machine Serial #
                          </label>
                          <input
                            type="text"
                            name="machineSerial"
                            value={formData.machineSerial}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                            placeholder="For exact fit verification"
                          />
                        </div>
                      </div>

                      {/* Urgency Selection */}
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
                          <Zap className="w-4 h-4" />
                          How soon do you need it?
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {URGENCY_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, urgency: option.value }))}
                              className={`
                                p-3 rounded-lg border-2 text-center transition-all
                                ${formData.urgency === option.value
                                  ? 'border-canyon-rust bg-canyon-rust/5'
                                  : 'border-slate-200 hover:border-slate-300'
                                }
                              `}
                            >
                              <span className="text-lg">{option.icon}</span>
                              <p className={`text-sm font-medium ${formData.urgency === option.value ? 'text-canyon-rust' : 'text-slate-700'}`}>
                                {option.label}
                              </p>
                              <p className="text-xs text-slate-500">{option.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                          <MessageSquare className="w-4 h-4" />
                          Additional Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors resize-none"
                          placeholder="Any special requirements or questions..."
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-canyon-rust text-white font-semibold rounded-lg hover:bg-canyon-rust/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Quote Request
                          </>
                        )}
                      </button>

                      <p className="text-xs text-center text-slate-500">
                        We typically respond within 24 hours. For emergency parts, call{' '}
                        <a href="tel:+18005551234" className="text-canyon-rust font-medium">
                          1-800-555-1234
                        </a>
                      </p>
                    </form>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

