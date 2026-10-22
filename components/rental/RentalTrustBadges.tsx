import React from 'react';

export default function RentalTrustBadges() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-8 mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-canyon-rust/10 text-canyon-rust rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900">Quote</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Send the machine and the dates. The rate comes back on the quote.
          </p>
        </div>
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-canyon-rust/10 text-canyon-rust rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900">Inspection</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            This page does not say a technician inspected the machine.
          </p>
        </div>
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-canyon-rust/10 text-canyon-rust rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900">Rate</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            This page does not publish a day rate or a long-term discount.
          </p>
        </div>
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-canyon-rust/10 text-canyon-rust rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900">Service</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We do not send a technician to the job site. Questions go through the contact page.
          </p>
        </div>
      </div>
    </section>
  );
}
