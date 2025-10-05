import React from 'react';

interface Bullet {
  text: string;
  sub?: string[];
}

export type OshaBasicsCardProps = {
  title: string;               // e.g., "OSHA 1910.178 — Pre-Operation Requirements"
  calloutTitle?: string;       // small badge title (optional)
  calloutBody?: React.ReactNode; // highlighted message body (optional)
  bullets: Bullet[];           // primary bullet list
  tip?: string;                // footnote in a subtle info box
  testId?: string;             // data-testid hook
};

export default function OshaBasicsCard({
  title,
  calloutTitle,
  calloutBody,
  bullets,
  tip,
  testId
}: OshaBasicsCardProps) {
  return (
    <section className="rounded-2xl border bg-white p-6" data-testid={testId}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <header className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-600 mt-2">Essential safety requirements for OSHA compliance</p>
        </header>

        {calloutBody && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl font-bold">
                !
              </div>
              <div>
                {calloutTitle && (
                  <h3 className="font-bold text-amber-900">{calloutTitle}</h3>
                )}
                <div className="text-sm text-amber-800 mt-1">{calloutBody}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {bullets.map((b, i) => (
            <div key={i} className="group bg-white rounded-xl border-2 border-slate-200 hover:border-[#F76511] transition-all p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F76511]"></div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-[#F76511] flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-slate-800">{b.text}</p>
                  {b.sub && b.sub.length > 0 && (
                    <ul className="mt-2 ml-3 space-y-1 text-xs text-slate-600">
                      {b.sub.map((s, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-[#F76511] font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {tip && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl">
                💡
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">Reference</h4>
                <p className="text-sm text-blue-800">{tip}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <a
            href="https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178"
            target="_blank"
            rel="noopener"
            aria-label="View OSHA 1910.178"
            className="inline-flex items-center gap-2 text-sm text-[#F76511] hover:text-orange-600 font-medium underline"
          >
            📄 View Full OSHA 1910.178 Regulation →
          </a>
        </div>
      </div>
    </section>
  );
}
