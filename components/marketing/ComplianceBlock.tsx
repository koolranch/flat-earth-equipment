interface ComplianceBlockProps {
  t: any;
}

export default function ComplianceBlock({ t }: ComplianceBlockProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">{t.compliance.title}</h2>
      <ul className="space-y-4 text-base leading-7 text-slate-700">
        {t.compliance.bullets.map((b: string, i: number) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-[#F76511] flex items-center justify-center text-sm font-bold mt-0.5">
              ✓
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
        <p className="text-sm text-amber-900">
          <strong className="text-amber-800">Important:</strong> {t.compliance.note}
        </p>
      </div>
    </section>
  );
}
