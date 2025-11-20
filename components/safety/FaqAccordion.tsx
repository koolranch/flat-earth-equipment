'use client';
import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  title: string;
}

export default function FaqAccordion({ items, title }: FaqAccordionProps) {
  const [showAllMobile, setShowAllMobile] = useState(false);

  // Critical questions for mobile: indices 0, 1, 3
  // 0: Will employers accept
  // 1: How fast
  // 3: What if I fail
  const criticalIndices = [0, 1, 3];
  const remainingIndices = [2, 4, 5];

  return (
    <section id="faq" className="mt-12 bg-white rounded-2xl border border-slate-200/60 shadow-sm px-6 py-8 sm:p-10">
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-slate-900 tracking-tight text-center">Frequently Asked Questions</h2>
      
      {/* Desktop: Show all questions */}
      <div className="hidden md:block divide-y divide-slate-100">
        {items.map((f, i) => (
          <details key={i} className="py-5 group">
            <summary className="cursor-pointer font-semibold text-slate-900 hover:text-orange-600 transition-colors list-none flex items-center justify-between select-none">
              <span className="text-lg">{f.q}</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform ml-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </span>
            </summary>
            <p className="text-base leading-relaxed text-slate-600 mt-3 pr-8 animate-in slide-in-from-top-2 duration-200">
              {f.a}
            </p>
          </details>
        ))}
      </div>

      {/* Mobile: Show critical questions first */}
      <div className="md:hidden divide-y divide-slate-100">
        {/* Critical questions always visible */}
        {criticalIndices.map((idx) => {
          const f = items[idx];
          if (!f) return null;
          return (
            <details key={idx} className="py-5 group">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-orange-600 transition-colors list-none flex items-center justify-between select-none">
                <span className="text-base leading-snug pr-4">{f.q}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform ml-2 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </summary>
              <p className="text-base leading-relaxed text-slate-600 mt-3 animate-in slide-in-from-top-2 duration-200">
                {f.a}
              </p>
            </details>
          );
        })}

        {/* Show More Button */}
        {!showAllMobile && (
          <div className="py-6 text-center">
            <button
              onClick={() => setShowAllMobile(true)}
              className="inline-flex items-center gap-2 text-orange-600 font-medium px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors text-sm"
            >
              <span>Show 3 More Questions</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
        )}

        {/* Remaining questions when expanded */}
        {showAllMobile && remainingIndices.map((idx) => {
          const f = items[idx];
          if (!f) return null;
          return (
            <details key={idx} className="py-5 group">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-orange-600 transition-colors list-none flex items-center justify-between select-none">
                <span className="text-base leading-snug pr-4">{f.q}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform ml-2 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </summary>
              <p className="text-base leading-relaxed text-slate-600 mt-3 animate-in slide-in-from-top-2 duration-200">
                {f.a}
              </p>
            </details>
          );
        })}

        {/* Show Less Button */}
        {showAllMobile && (
          <div className="py-6 text-center">
            <button
              onClick={() => setShowAllMobile(false)}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              <span>Show Less</span>
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Trust Badges Footer */}
      <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4 text-center">
         <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Secure Payment Methods</p>
         <div className="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            {/* Simple text badges for clarity and speed */}
            <span className="flex items-center gap-1.5 border border-slate-200 rounded px-2 py-1 bg-slate-50">
              <span className="text-xs font-bold text-slate-700"> Pay</span>
            </span>
            <span className="flex items-center gap-1.5 border border-slate-200 rounded px-2 py-1 bg-slate-50">
               <span className="text-xs font-bold text-slate-700">G Pay</span>
            </span>
            <span className="flex items-center gap-1.5 border border-slate-200 rounded px-2 py-1 bg-slate-50">
               <span className="text-xs font-bold text-slate-700">Visa</span>
            </span>
            <span className="flex items-center gap-1.5 border border-slate-200 rounded px-2 py-1 bg-slate-50">
               <span className="text-xs font-bold text-slate-700">MC</span>
            </span>
         </div>
         <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
           <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
           100% Money Back Guarantee
         </p>
      </div>
    </section>
  );
}

