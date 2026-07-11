import Link from 'next/link';
import type { CommonFaultCode } from '@/lib/faults/jcbCommonCodes';

export default function CommonFaultCodesTable({
  brandName,
  codes,
}: {
  brandName: string;
  codes: CommonFaultCode[];
}) {
  if (!codes.length) return null;

  return (
    <section className="mt-8" aria-labelledby="common-fault-codes-heading">
      <h2 id="common-fault-codes-heading" className="text-xl font-semibold text-slate-900 mb-2">
        Common {brandName} fault codes
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        High-frequency codes techs look up first. Use search above for more, and always confirm with
        official service procedures before replacing parts.
      </p>
      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3 font-medium">Code</th>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">What it usually means</th>
              <th className="p-3 font-medium">Check first</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((row) => (
              <tr key={row.code} className="border-t align-top">
                <td className="p-3 font-mono whitespace-nowrap">
                  {row.relatedGuideHref ? (
                    <Link href={row.relatedGuideHref} className="text-primary underline hover:no-underline">
                      {row.code}
                    </Link>
                  ) : (
                    row.code
                  )}
                </td>
                <td className="p-3 font-medium text-slate-900">{row.title}</td>
                <td className="p-3 text-muted-foreground">{row.meaning}</td>
                <td className="p-3 text-muted-foreground">{row.firstChecks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
