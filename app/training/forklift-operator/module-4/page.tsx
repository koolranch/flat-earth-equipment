'use client';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import Module4OSHA from '@/app/training/[course]/modules/module-4/OSHA';
import { Module4Practice } from '@/components/training/practice/Module4Practice';
// Removed flashCards import - now using runtime fetch

export default function Page(){
  return (
    <TabbedModuleLayout
      courseSlug='forklift_operator'
      moduleSlug='module_4_hazards'
      title='Module 4: Hazard Hunt'
      nextHref='/training/forklift-operator/module-5'
      flashModuleKey="module-4"
      flashCardCount={8}
      osha={<Module4OSHA />}
      practice={({onComplete}) => <Module4Practice onComplete={onComplete} />}
      quizMeta={{ questions: 8, passPct: 80 }}
    />
  );
}
