import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import QuizGate from '@/components/module/QuizGate';

const L = (k: string, locale: string) => {
  const en: any = { 
    'hub.modules_intro': 'Do the demo. Read the quick Guides. Take the short quiz.',
    'quiz.check_knowledge': 'Check your knowledge',
    'quiz.quick_questions': '5–7 quick questions. Pass ≥80%.'
  };
  const es: any = { 
    'hub.modules_intro': 'Haz la demo. Lee las guías. Responde el mini-quiz.',
    'quiz.check_knowledge': 'Verifica tu conocimiento',
    'quiz.quick_questions': '5–7 preguntas rápidas. Aprobar ≥80%.'
  };
  return (locale==='es'?es:en)[k];
};

// Map module orders to their content routes
const MODULE_ROUTES: Record<number, string> = {
  1: '/module/pre-op/demo/minippe', // Introduction - PPE demo
  2: '/module/inspection/demo/hotspots', // Module 1: Pre-Operation Inspection - 8-point inspection
  3: '/module/stability/sim', // Module 2: 8-Point Inspection - stability simulation  
  4: '/module/load-capacity', // Module 3: Balance & Load Handling - load capacity calculator
  5: '/module/pre-op/controls', // Module 4: Hazard Hunt - controls demo (placeholder)
};

// Map module IDs to slugs for QuizGate
function getModuleSlug(id: string): string {
  switch (Number(id)) {
    case 1: return 'pre-operation-inspection'
    case 2: return 'eight-point-inspection'
    case 3: return 'balance-load-handling'
    case 4: return 'hazard-hunt'
    case 5: return 'shutdown-sequence'
    default: return `module${id}`
  }
}

export default async function ModulePage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  
  try {
    // Get module details by ID
    const { data: module, error } = await sb
      .from('modules')
      .select('id, title, order, type, game_asset_key')
      .eq('id', params.id)
      .single();

    if (error || !module) {
      redirect('/dashboard');
    }

    // Map module order to content route
    const contentRoute = MODULE_ROUTES[module.order];
    
    return (
      <main className='container mx-auto p-4 space-y-4'>
        <header>
          <h1 className='text-2xl font-bold text-[#0F172A] dark:text-white'>{module.title}</h1>
          <p className='text-sm text-slate-600 dark:text-slate-300'>{L('hub.modules_intro', locale)}</p>
        </header>

        {contentRoute && (
          <section className='rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700'>
            <h2 className='text-lg font-semibold mb-2'>Interactive Demo</h2>
            <p className='text-sm text-slate-600 dark:text-slate-300 mb-3'>Learn by doing with hands-on practice.</p>
            <a 
              className='inline-flex items-center justify-center rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg' 
              href={contentRoute}
            >
              Start Demo
            </a>
          </section>
        )}

        <section className='rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700'>
          <div className='flex items-center justify-between gap-2'>
            <div>
              <h2 className='text-lg font-semibold'>{L('quiz.check_knowledge', locale)}</h2>
              <p className='text-sm text-slate-600 dark:text-slate-300'>{L('quiz.quick_questions', locale)}</p>
            </div>
            {/* env-controlled soft gating */}
            <QuizGate slug={getModuleSlug(params.id)} moduleId={params.id} />
          </div>
        </section>

        {!contentRoute && (
          <section className='rounded-2xl border p-4 md:p-6 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'>
            <h2 className='text-lg font-semibold text-slate-600 dark:text-slate-400'>Coming Soon</h2>
            <p className='text-sm text-slate-500 dark:text-slate-400'>This module content is being prepared.</p>
          </section>
        )}
      </main>
    );
  } catch (error) {
    console.error('Module route error:', error);
    redirect('/dashboard');
  }
}
