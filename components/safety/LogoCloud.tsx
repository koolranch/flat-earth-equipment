/**
 * Enterprise Logo Cloud
 * Displays trusted enterprise clients for social proof
 * Text-only representations to avoid trademark issues
 */

export default function LogoCloud() {
  const companies = [
    { name: 'COCA-COLA', color: 'text-red-600' },
    { name: 'NESTLÉ', color: 'text-blue-900' },
    { name: 'SHERWIN-WILLIAMS', color: 'text-red-700' },
    { name: '84 LUMBER', color: 'text-orange-600' },
  ];

  return (
    <section className="py-8 border-y border-slate-100 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          Trusted by safety managers at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {companies.map((company) => (
            <span
              key={company.name}
              className={`text-xl md:text-2xl font-black ${company.color} opacity-40 hover:opacity-60 transition-opacity duration-300 whitespace-nowrap`}
            >
              {company.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

