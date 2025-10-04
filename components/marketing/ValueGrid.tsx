interface ValueGridProps {
  t: any;
}

export default function ValueGrid({ t }: ValueGridProps) {
  return (
    <section className="grid sm:grid-cols-2 gap-4">
      {t.value.items.map((v: any, i: number) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-slate-900 mb-2">{v.title}</h3>
          <p className="text-base leading-7 text-slate-700">{v.body}</p>
        </div>
      ))}
    </section>
  );
}
