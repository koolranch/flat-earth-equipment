'use client';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import Module1OSHA from '@/app/training/[course]/modules/module-1/OSHA';
import { Module1Practice } from '@/components/training/practice/Module1Practice';

export default function PreOpModule() {
  return (
    <TabbedModuleLayout
      courseSlug='forklift_operator'
      moduleSlug='module_1_preop'
      moduleKey='m1'
      title='Module 1: Pre-Operation'
      nextHref='/training/forklift-operator/module-2'
      flashModuleKey="module-1"
      flashCardCount={8}
      osha={<Module1OSHA />}
      practice={({onComplete}) => <Module1Practice onComplete={onComplete} />}
      quizMeta={{ questions: 8, passPct: 80 }}
    />
  );
}
