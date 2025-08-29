'use client';

export default function ResultsToast({ pass, scorePct, nextHref }: { pass: boolean; scorePct: number; nextHref?: string }){
  return (
    <div className={`mt-3 rounded-2xl border p-4 ${pass ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-400'}`}>
      <div className="font-semibold">{pass ? 'Passed' : 'Try again'}</div>
      <div className="text-sm text-slate-700">Score: {Math.round(scorePct)}%</div>
      {pass && nextHref ? (
        <a href={nextHref} className="mt-2 inline-flex rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg">Next module</a>
      ) : null}
    </div>
  );
}
