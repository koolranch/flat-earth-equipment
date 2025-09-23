'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ResumeButton({ courseSlug }: { courseSlug: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const onClick = async () => {
    try {
      setLoading(true); setErr(null);
      const r = await fetch(`/api/training/next?courseId=${encodeURIComponent(courseSlug)}`, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok || !j?.ok) {
        setErr(j?.reason || 'Unable to find next module');
        setLoading(false);
        return;
      }
      router.push(`/training/module/${j.nextOrder}?courseId=${encodeURIComponent(courseSlug)}`);
    } catch (e: any) {
      setErr(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        onClick={onClick} 
        className="btn-primary" 
        disabled={loading}
        data-testid="resume-training"
      >
        {loading ? 'Loading…' : 'Resume training'}
      </button>
      {err && <div className="text-xs text-red-600">{err}</div>}
    </div>
  );
}
