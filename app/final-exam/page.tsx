export default function Page(){
  return (
    <main className="container mx-auto p-4 space-y-3">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Final exam</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">12 quick scenarios. Pass ≥80% to get certified.</p>
      </header>
      <ClientExamWrapper />
    </main>
  );
}

function ClientExamWrapper(){
  // client-only shim to listen for pass event and POST completion
  if (typeof window !== 'undefined'){
    const onEnd = (e:any)=>{
      const d = e?.detail||{}; if (!d) return;
      if (d.evt==='exam_passed'){
        try { 
          fetch('/api/exam/complete', { 
            method:'POST', 
            headers:{'Content-Type':'application/json'}, 
            body: JSON.stringify({ score:d.score }) 
          }); 
        } catch {}
      }
    };
    window.addEventListener('analytics', onEnd as any, { once:false });
  }
  const DynamicExam = require('@/components/exam/DynamicExam').default;
  return <DynamicExam slug="final-exam"/>;
}
