'use client';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import Module5OSHA from '@/app/training/[course]/modules/module-5/OSHA';
import { Module5Practice } from '@/components/training/practice/Module5Practice';
// Removed flashCards import - now using runtime fetch

export default function Page(){
  return (
    <TabbedModuleLayout
      courseSlug='forklift_operator'
      moduleSlug='module_5_advanced'
      moduleKey='m5'
      title='Module 5: Advanced Operations'
      nextHref='/training/forklift-operator/exam'
      flashModuleKey="module-5"
      flashCardCount={8}
      osha={<Module5OSHA />}
      practice={({onComplete}) => <Module5Practice onComplete={onComplete} />}
      quizMeta={{ questions: 10, passPct: 80 }}
    />
  );
}
