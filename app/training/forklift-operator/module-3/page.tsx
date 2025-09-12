'use client';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import Module3OSHA from '@/app/training/[course]/modules/module-3/OSHA';
import { Module3Practice } from '@/components/training/practice/Module3Practice';
// Removed flashCards import - now using runtime fetch

export default function Page(){
  return (
    <TabbedModuleLayout
      courseSlug='forklift_operator'
      moduleSlug='module_3_balance'
      title='Module 3: Balance & Load Handling'
      nextHref='/training/forklift-operator/module-4'
      flashModuleKey="module-3"
      flashCardCount={8}
      osha={<Module3OSHA />}
      practice={({onComplete}) => <Module3Practice onComplete={onComplete} />}
      quizMeta={{ questions: 8, passPct: 80 }}
    />
  );
}
