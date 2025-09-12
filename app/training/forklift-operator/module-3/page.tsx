'use client';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import { OSHAContentModule3 } from '@/components/training/osha/Module3';
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
      osha={<OSHAContentModule3 />}
      practice={({onComplete}) => <Module3Practice onComplete={onComplete} />}
      quizMeta={{ questions: 8, passPct: 80 }}
    />
  );
}
