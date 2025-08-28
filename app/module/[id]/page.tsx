import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

// Map module orders to their content routes
const MODULE_ROUTES: Record<number, string> = {
  1: '/module/pre-op/demo/minippe', // Introduction - PPE demo
  2: '/module/inspection/demo/hotspots', // Module 1: Pre-Operation Inspection - 8-point inspection
  3: '/module/stability/sim', // Module 2: 8-Point Inspection - stability simulation  
  4: '/module/load-capacity', // Module 3: Balance & Load Handling - load capacity calculator
  5: '/module/pre-op/controls', // Module 4: Hazard Hunt - controls demo (placeholder)
};

export default async function ModulePage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  
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
    
    if (contentRoute) {
      redirect(contentRoute);
    } else {
      // Fallback for unmapped modules - show a placeholder
      return (
        <main className="container mx-auto p-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">{module.title}</h1>
            <p className="text-gray-600 mb-6">This module content is coming soon.</p>
            <a 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Back to Dashboard
            </a>
          </div>
        </main>
      );
    }
  } catch (error) {
    console.error('Module route error:', error);
    redirect('/dashboard');
  }
}
