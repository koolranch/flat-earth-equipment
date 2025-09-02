'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic imports for existing game components
const MiniPPE = dynamic(() => import('@/components/games/module1/MiniPPE'), { ssr: false });
const MiniInspection = dynamic(() => import('@/components/games/module2/MiniInspection'), { ssr: false });
const StabilityTriangleSim = dynamic(() => import('@/components/games/module3/StabilityTriangleSim'), { ssr: false });
const MiniHazard = dynamic(() => import('@/components/games/module4/MiniHazard'), { ssr: false });
const MiniShutdown = dynamic(() => import('@/components/games/module5/MiniShutdown'), { ssr: false });

// Registry mapping demo names to components
const GAME_REGISTRY: Record<string, React.ComponentType<any>> = {
  'pre-operation-inspection': MiniPPE,
  'eight-point-inspection': MiniInspection,
  'stability-triangle': StabilityTriangleSim,
  'hazard-hunt': MiniHazard,
  'shutdown-sequence': MiniShutdown,
};

interface GameComponentProps {
  name: string;
  locale?: 'en' | 'es';
  onComplete?: () => void;
}

export default function GameComponent({ name, locale = 'en', onComplete }: GameComponentProps) {
  const GameComp = GAME_REGISTRY[name];

  if (!GameComp) {
    return (
      <div className="rounded-lg border p-4 bg-gray-50 dark:bg-slate-800">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Demo "{name}" not found. Available demos: {Object.keys(GAME_REGISTRY).join(', ')}
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
        <span className="ml-2 text-sm text-gray-600">Loading interactive demo...</span>
      </div>
    }>
      <GameComp 
        locale={locale} 
        onComplete={onComplete || (() => console.log(`${name} demo completed`))}
        moduleSlug={name}
      />
    </Suspense>
  );
}
