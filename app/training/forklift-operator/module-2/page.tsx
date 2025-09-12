'use client';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import Module2OSHA from '@/app/training/[course]/modules/module-2/OSHA';
import { Module2Practice } from '@/components/training/practice/Module2Practice';
// Using new content system with standardized flashcards and quizzes

export default function Page(){
  return (
    <TabbedModuleLayout
      courseSlug='forklift_operator'
      moduleSlug='module_2_inspection'
      title='Module 2: 8-Point Inspection'
      nextHref='/training/forklift-operator/module-3'
      flashModuleKey="module-2"
      flashCardCount={8}
      osha={<Module2OSHA />}
      practice={({onComplete}) => <Module2Practice onComplete={onComplete} />}
      quizMeta={{ questions: 8, passPct: 80 }}
    />
  );
}
