export default function HowItWorksStrip() {
  const steps = [
    { h: "1) Online theory (~30 min)", p: "Interactive checks & demos—phone friendly." },
    { h: "2) Employer Practical", p: "Supervisor evaluates on your equipment using our checklist." },
    { h: "3) Same-day wallet card", p: "Instant certificate + 3-year renewal reminder." },
  ];
  
  return (
    <section aria-labelledby="how" className="mt-10">
      <h2 id="how" className="text-2xl font-bold text-slate-900">How it works</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map(s => (
          <div key={s.h} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-semibold text-slate-900">{s.h}</p>
            <p className="mt-1 text-sm text-gray-700">{s.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

