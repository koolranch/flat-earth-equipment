export default function HowItWorksStrip() {
  const steps = [
    { id: 1, h: "Online theory (~30 min)", p: "Interactive checks & demos—phone friendly." },
    { id: 2, h: "Employer Practical", p: "Supervisor evaluates on your equipment using our checklist." },
    { id: 3, h: "Same-day wallet card", p: "Instant certificate + 3-year renewal reminder." },
  ];
  
  return (
    <section aria-labelledby="how" className="mt-12 sm:mt-16 mb-8">
      <h2 id="how" className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-8 sm:mb-12 text-center">How it works</h2>
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Connector Line (Desktop) */}
        <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10" />
        
        {steps.map((s) => (
          <div key={s.id} className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 text-center">
            {/* Step Number Badge */}
            <div className="mx-auto w-12 h-12 rounded-full bg-white border-2 border-orange-100 text-orange-600 font-bold flex items-center justify-center mb-4 shadow-sm group-hover:border-orange-500 group-hover:scale-110 transition-all duration-300 z-10">
              {s.id}
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{s.h}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{s.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

