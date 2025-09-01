interface ComplianceBlockProps {
  t: any;
}

export default function ComplianceBlock({ t }: ComplianceBlockProps) {
  return (
    <section className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
      <h2 className="text-xl font-bold mb-2">{t.compliance.title}</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {t.compliance.bullets.map((b: string, i: number) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{t.compliance.note}</p>
    </section>
  );
}
