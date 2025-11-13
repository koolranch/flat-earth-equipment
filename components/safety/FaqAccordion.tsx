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
    <section id="faq" className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">{title}</h2>
      
      {/* Desktop: Show all questions */}
      <div className="hidden md:block divide-y divide-slate-200">
        {items.map((f, i) => (
          <details key={i} className="py-5 group">
            <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none tappable">
              <div className="flex items-center justify-between">
                <span className="text-base leading-7">{f.q}</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">
                  ▼
                </span>
              </div>
            </summary>
            <p className="text-base leading-7 text-slate-700 mt-3">
              {f.a}
            </p>
          </details>
        ))}
      </div>

      {/* Mobile: Show critical questions first */}
      <div className="md:hidden divide-y divide-slate-200">
        {/* Critical questions always visible */}
        {criticalIndices.map((idx) => {
          const f = items[idx];
          if (!f) return null;
          return (
            <details key={idx} className="py-5 group">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none tappable">
                <div className="flex items-center justify-between">
                  <span className="text-base leading-7">{f.q}</span>
                  <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">
                    ▼
                  </span>
                </div>
              </summary>
              <p className="text-base leading-7 text-slate-700 mt-3">
                {f.a}
              </p>
            </details>
          );
        })}

        {/* Show More Button */}
        {!showAllMobile && (
          <div className="py-5 text-center">
            <button
              onClick={() => setShowAllMobile(true)}
              className="inline-flex items-center gap-2 text-[#F76511] hover:text-orange-600 font-medium px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <span>Show 3 More Questions</span>
              <span>▼</span>
            </button>
          </div>
        )}

        {/* Remaining questions when expanded */}
        {showAllMobile && remainingIndices.map((idx) => {
          const f = items[idx];
          if (!f) return null;
          return (
            <details key={idx} className="py-5 group">
              <summary className="cursor-pointer font-semibold text-slate-900 hover:text-[#F76511] transition-colors list-none tappable">
                <div className="flex items-center justify-between">
                  <span className="text-base leading-7">{f.q}</span>
                  <span className="text-slate-500 group-open:rotate-180 transition-transform ml-2">
                    ▼
                  </span>
                </div>
              </summary>
              <p className="text-base leading-7 text-slate-700 mt-3">
                {f.a}
              </p>
            </details>
          );
        })}

        {/* Show Less Button */}
        {showAllMobile && (
          <div className="py-5 text-center">
            <button
              onClick={() => setShowAllMobile(false)}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-[#F76511] font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span>Show Less</span>
              <span className="rotate-180">▼</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

