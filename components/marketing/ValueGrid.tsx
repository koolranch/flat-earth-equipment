interface ValueGridProps {
  t: any;
}

export default function ValueGrid({ t }: ValueGridProps) {
  return (
    <section className="grid sm:grid-cols-2 gap-3">
      {t.value.items.map((v: any, i: number) => (
        <div key={i} className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
          <div className="text-base font-semibold">{v.title}</div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{v.body}</p>
        </div>
      ))}
    </section>
  );
}
