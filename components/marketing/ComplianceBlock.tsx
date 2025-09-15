interface ComplianceBlockProps {
  t: any;
}

export default function ComplianceBlock({ t }: ComplianceBlockProps) {
  return (
    <section className="panel-soft shadow-card px-6 py-6">
      <h2 className="text-2xl font-semibold mb-4 text-brand-onPanel">{t.compliance.title}</h2>
      <ul className="list-disc pl-6 space-y-3 text-base leading-7 text-brand-onPanel/90">
        {t.compliance.bullets.map((b: string, i: number) => (
          <li key={i} className="prose-readable">{b}</li>
        ))}
      </ul>
      <p className="text-sm text-brand-onPanel/70 mt-4 prose-readable border-l-2 border-brand-orangeBright/30 pl-4">
        <strong>Important:</strong> {t.compliance.note}
      </p>
    </section>
  );
}
