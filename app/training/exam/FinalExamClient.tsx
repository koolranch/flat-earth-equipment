'use client';
import { useEffect, useState } from 'react';
import ExamWrapper from '@/components/training/ExamWrapper';

export default function FinalExamClient({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<{loading: boolean; err: string | null; data: any | null}>({ 
    loading: true, 
    err: null, 
    data: null 
  });

  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        const r = await fetch(`/api/training/exam/session/${sessionId}`);
        const json = await r.json();
        if (ignore) return;
        if (!json.ok) {
          setState({ loading: false, err: json.reason || 'load-failed', data: null });
        } else {
          setState({ loading: false, err: null, data: json });
        }
      } catch (e: any) {
        if (!ignore) setState({ loading: false, err: e?.message || 'network-error', data: null });
      }
    }
    run();
    return () => { ignore = true; };
  }, [sessionId]);

  if (state.loading) return <div className="text-sm text-slate-600">Loading exam…</div>;
  if (state.err) return <div className="text-sm text-red-600">Unable to load exam: {state.err}</div>;

  // Use the existing ExamWrapper which already works with the current exam infrastructure
  // Pass the session data if we have it from the API
  return (
    <ExamWrapper 
      mode="resume" 
      sessionData={{
        id: sessionId,
        items: state.data?.questions || [],
        remaining_sec: state.data?.session?.remainingSec || 0,
        locale: state.data?.paper?.locale || 'en'
      }}
    />
  );
}
