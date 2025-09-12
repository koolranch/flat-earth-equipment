'use client';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import { OSHAContentModule5 } from '@/components/training/osha/Module5';
import { Module5Practice } from '@/components/training/practice/Module5Practice';
// Removed flashCards import - now using runtime fetch

export default function Page(){
  return (
    <TabbedModuleLayout
      courseSlug='forklift_operator'
      moduleSlug='module_5_advanced'
      title='Module 5: Advanced Operations'
      nextHref='/training/forklift-operator/exam'
      flashModuleKey="module-5"
      osha={<OSHAContentModule5 />}
      practice={({onComplete}) => <Module5Practice onComplete={onComplete} />}
      quizMeta={{ questions: 10, passPct: 80 }}
    />
  );
}
