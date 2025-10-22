export default function ReasonsToJoin() {
  const items = [
    { title: "Finish in ~60 minutes", body: "Interactive modules keep you moving—no long videos." },
    { title: "Same-day wallet card", body: "QR-verifiable certificate issued immediately after passing." },
    { title: "Employer-accepted nationwide", body: "Built to match OSHA 29 CFR 1910.178(l) requirements." },
    { title: "English & Spanish", body: "Switch language anytime—desktop or phone." },
  ];
  
  return (
    <section aria-labelledby="reasons" className="mt-8">
      <h2 id="reasons" className="sr-only">Reasons to join</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {items.map((i) => (
          <div key={i.title} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-semibold text-slate-900">{i.title}</p>
            <p className="mt-1 text-sm text-gray-700">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

