import React, { useEffect, useState } from 'react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import type { CourseModule } from '@/lib/progress';

interface HeaderProgressProps {
  modules?: CourseModule[];
  fallbackPercent?: number;
  className?: string;
}

function getLocalStorageProgress(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('training:progress:v1') || '{}');
  } catch {
    return {};
  }
}

export function HeaderProgress({ modules, fallbackPercent = 0, className = '' }: HeaderProgressProps) {
  const [localProgress, setLocalProgress] = useState<Record<string, any>>({});
  
  useEffect(() => {
    setLocalProgress(getLocalStorageProgress());
    
    // Listen for localStorage changes
    const handleStorageChange = () => {
      setLocalProgress(getLocalStorageProgress());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when modules are completed
    const handleModuleComplete = () => {
      setLocalProgress(getLocalStorageProgress());
    };
    
    window.addEventListener('module_complete', handleModuleComplete);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('module_complete', handleModuleComplete);
    };
  }, []);
  
  // Enhance modules with localStorage completion data
  const enhancedModules = React.useMemo(() => {
    if (!modules) return modules;
    
    return modules.map((module) => {
      // Use the module's actual order, not array index
      // This handles filtered arrays correctly
      const moduleOrder = (module as any).order;
      const localStorageKey = moduleOrder ? `module_${moduleOrder}` : null;
      const isCompleted = module.quiz_passed || (localStorageKey && !!localProgress[localStorageKey]?.quiz?.passed);
      
      return {
        ...module,
        quiz_passed: isCompleted
      };
    });
  }, [modules, localProgress]);
  
  const { percent } = useCourseProgress(enhancedModules);
  const value = Number.isFinite(percent) && percent > 0 ? percent : fallbackPercent;
  
  // Calculate X/Y completion from modules
  const totalModules = enhancedModules?.length || 0;
  const completedModules = enhancedModules?.filter(m => m.quiz_passed).length || 0;
  
  return (
    <div className={`min-w-[160px] ${className}`}>
      <div className='text-sm font-medium text-brand-onPanel mb-2'>
        {completedModules}/{totalModules} complete
      </div>
      <div 
        className='h-2 bg-brand-onPanel/20 rounded-full overflow-hidden'
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={`Course progress: ${completedModules} of ${totalModules} modules complete`}
      >
        <div 
          className='h-2 bg-brand-orangeBright rounded-full transition-all duration-300' 
          style={{ width: `${value}%` }} 
        />
      </div>
      <div className='text-xs text-brand-onPanel/60 mt-1'>
        {value}% overall
      </div>
    </div>
  );
}
