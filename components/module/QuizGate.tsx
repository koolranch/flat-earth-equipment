'use client';
import { useEffect, useState } from 'react';

export default function QuizGate({ slug, moduleId }: { slug: string; moduleId?: string }){
  const [ok, setOk] = useState(true);
  
  useEffect(() => {
    try {
      const gate = process.env.NEXT_PUBLIC_GATE_QUIZ_BY_DEMO === '1';
      if (!gate) return;
      
      const v = localStorage.getItem(`demo:${slug}:complete`) === '1';
      setOk(v);
      
      const onChange = () => setOk(localStorage.getItem(`demo:${slug}:complete`) === '1');
      window.addEventListener('storage', onChange);
      window.addEventListener('demo_status', onChange as any);
      
      return () => { 
        window.removeEventListener('storage', onChange); 
        window.removeEventListener('demo_status', onChange as any); 
      };
    } catch { 
      setOk(true); 
    }
  }, [slug]);

  const quizUrl = `/module/${moduleId || slug}/quiz`;
  
  if (ok) return (
    <a 
      className="inline-flex items-center justify-center rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg" 
      href={quizUrl}
    >
      Start quiz
    </a>
  );
  
  return (
    <div className="flex items-center gap-3">
      <button 
        disabled 
        className="inline-flex items-center justify-center rounded-2xl bg-slate-400 text-white px-4 py-2 shadow-lg cursor-not-allowed"
      >
        Start quiz
      </button>
      <a 
        className="text-sm underline text-slate-600 hover:text-slate-800" 
        href={quizUrl}
      >
        Skip for now
      </a>
    </div>
  );
}
