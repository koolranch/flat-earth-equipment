interface ValueGridProps {
  t: any;
}

export default function ValueGrid({ t }: ValueGridProps) {
  return (
    <section className="grid sm:grid-cols-2 gap-4">
      {t.value.items.map((v: any, i: number) => (
        <div 
          key={i} 
          className={`group bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-8 py-8 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ${i >= 2 ? 'hidden md:block' : ''}`}
        >
          <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight group-hover:text-orange-600 transition-colors">{v.title}</h3>
          <p className="text-base leading-relaxed text-slate-600">{v.body}</p>
        </div>
      ))}
    </section>
  );
}
