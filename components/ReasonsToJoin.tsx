export default function ReasonsToJoin() {
  const items = [
    { 
      title: "Finish in ~30 minutes", 
      body: "Interactive modules keep you moving—no long videos.",
      icon: "⏱️"
    },
    { 
      title: "Same-day wallet card", 
      body: "QR-verifiable certificate issued immediately after passing.",
      icon: "📱"
    },
    { 
      title: "Employer-accepted nationwide", 
      body: "Built to match OSHA 29 CFR 1910.178(l) requirements.",
      icon: "✅"
    },
    { 
      title: "Free Lifetime Access", 
      body: "Pay once. Free renewals forever—even if you change employers.",
      icon: "♾️"
    },
  ];
  
  return (
    <section aria-labelledby="reasons" className="mt-8">
      <h2 id="reasons" className="sr-only">Reasons to join</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {items.map((i) => (
          <div 
            key={i.title} 
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {i.icon}
            </div>
            <p className="font-bold text-slate-900 text-lg mb-2 tracking-tight">{i.title}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

