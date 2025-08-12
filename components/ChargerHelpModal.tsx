"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ChargerHelpModal({ open, onClose }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onEsc);
    }
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Reset state when modal reopens
  useEffect(() => {
    if (open) {
      setIsSubmitted(false);
      setIsSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        company: formData.get("company"),
        phone: formData.get("phone"),
        forklift_make: formData.get("forklift_make"),
        forklift_model: formData.get("forklift_model"),
        battery_voltage: formData.get("battery_voltage"),
        battery_ah: formData.get("battery_ah"),
        current_charger: formData.get("current_charger"),
        notes: formData.get("notes"),
        timestamp: new Date().toISOString(),
        source: "charger-selector-help",
      };

      const response = await fetch("/api/quote-charger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting help request:", error);
      alert("There was an issue submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Get Charger Recommendation
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Tell us about your forklift and we'll recommend the perfect charger
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Request Submitted!</h3>
              <p className="text-neutral-600">
                We'll analyze your requirements and get back to you with the perfect charger recommendation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-neutral-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Forklift Info */}
              <div className="border-t border-neutral-200 pt-4">
                <h3 className="font-medium text-neutral-900 mb-3">Forklift Information</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="forklift_make" className="block text-sm font-medium text-neutral-700 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      id="forklift_make"
                      name="forklift_make"
                      required
                      placeholder="e.g., Toyota, Crown, Yale"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="forklift_model" className="block text-sm font-medium text-neutral-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      id="forklift_model"
                      name="forklift_model"
                      required
                      placeholder="e.g., 8FBE25, RC 5500"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Battery Info */}
              <div className="border-t border-neutral-200 pt-4">
                <h3 className="font-medium text-neutral-900 mb-3">Battery Information</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="battery_voltage" className="block text-sm font-medium text-neutral-700 mb-1">
                      Voltage
                    </label>
                    <select
                      id="battery_voltage"
                      name="battery_voltage"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select voltage</option>
                      <option value="24V">24V</option>
                      <option value="36V">36V</option>
                      <option value="48V">48V</option>
                      <option value="80V">80V</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="battery_ah" className="block text-sm font-medium text-neutral-700 mb-1">
                      Amp Hours (Ah)
                    </label>
                    <input
                      type="text"
                      id="battery_ah"
                      name="battery_ah"
                      placeholder="e.g., 460, 750, 1000"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="current_charger" className="block text-sm font-medium text-neutral-700 mb-1">
                    Current charger (if any)
                  </label>
                  <input
                    type="text"
                    id="current_charger"
                    name="current_charger"
                    placeholder="e.g., Brand, model, amp rating"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
                  Additional notes or requirements
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="e.g., Need fast charging, specific voltage requirements, quantity needed..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Get Recommendation"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
