// components/admin/AdminRosterTable.tsx
'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { RosterItem } from '@/lib/admin/roster.server';

export default function AdminRosterTable({ rows, orgId, locale }: { rows: RosterItem[]; orgId: string; locale: 'en'|'es' }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all'|'passed'|'failed'|'notstarted'>('all');
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const hay = `${r.learner_email||''} ${r.user_id} ${r.course_id}`.toLowerCase();
      if (q && !hay.includes(q.toLowerCase())) return false;
      if (filter==='passed') return !!r.passed;
      if (filter==='failed') return r.passed===false;
      if (filter==='notstarted') return !r.progress_pct || r.progress_pct===0;
      return true;
    });
  }, [rows,q,filter]);

  return (<section className='mt-4'>
    <div className='flex gap-2 flex-wrap items-center'>
      <input className='border rounded-2xl px-3 py-2' placeholder='Search email or ID' value={q} onChange={e=>setQ(e.target.value)} />
      <select className='border rounded-2xl px-3 py-2' value={filter} onChange={e=>setFilter(e.target.value as any)}>
        <option value='all'>All</option>
        <option value='passed'>Passed</option>
        <option value='failed'>Failed</option>
        <option value='notstarted'>Not started</option>
      </select>
      <a className='rounded-2xl border px-3 py-2' href={`/api/admin/exports/roster.csv?orgId=${orgId}`} target='_blank' rel='noreferrer'>Export CSV (requires token)</a>
    </div>
    <div className='mt-4 overflow-x-auto'>
      <table className='min-w-full text-sm'>
        <thead><tr><th className='text-left p-2'>Learner</th><th className='text-left p-2'>Course</th><th className='text-left p-2'>Progress</th><th className='text-left p-2'>Cert</th><th className='text-left p-2'>Eval</th><th className='text-left p-2'>Actions</th></tr></thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.enrollment_id} className='border-t'>
              <td className='p-2'>{r.learner_email||'—'}<div className='text-slate-500'>{r.user_id.slice(0,8)}</div></td>
              <td className='p-2'>{r.course_id.slice(0,8)}</td>
              <td className='p-2'>{r.progress_pct ?? 0}% {r.passed ? '✓' : ''}</td>
              <td className='p-2'>{r.certificate?.pdf_url ? <a className='text-[#F76511]' href={r.certificate.pdf_url} target='_blank'>PDF</a> : '—'} {r.certificate?.verifier_code ? <Link className='ml-2 underline' href={`/verify/${r.certificate.verifier_code}`}>Verify</Link> : null}</td>
              <td className='p-2'>{r.evaluation?.practical_pass===true ? 'Pass' : r.evaluation?.practical_pass===false ? 'Fail' : '—'}</td>
              <td className='p-2'><Link className='rounded-2xl border px-3 py-1' href={`/admin/evaluation/${r.enrollment_id}`}>Evaluate</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>);
}
