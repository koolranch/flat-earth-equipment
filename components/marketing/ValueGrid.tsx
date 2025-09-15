interface ValueGridProps {
  t: any;
}

export default function ValueGrid({ t }: ValueGridProps) {
  return (
    <section className="grid sm:grid-cols-2 gap-4">
      {t.value.items.map((v: any, i: number) => (
        <div key={i} className="panel-soft shadow-card px-5 py-5">
          <h3 className="text-lg font-semibold text-brand-onPanel mb-2">{v.title}</h3>
          <p className="text-base leading-7 text-brand-onPanel/90">{v.body}</p>
        </div>
      ))}
    </section>
  );
}
