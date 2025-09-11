'use client';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import { OSHAContentModule2 } from '@/components/training/osha/Module2';
import { Module2Practice } from '@/components/training/practice/Module2Practice';
import flashCards from '@/content/training/forklift-operator/module-2/flashcards.json';

export default function Page(){
  return (
    <TabbedModuleLayout
      courseSlug='forklift_operator'
      moduleSlug='module_2_inspection'
      title='Module 2: 8-Point Inspection'
      nextHref='/training/forklift-operator/module-3'
      flashCards={flashCards}
      osha={<OSHAContentModule2 />}
      practice={({onComplete}) => <Module2Practice onComplete={onComplete} />}
      quizMeta={{ questions: 8, passPct: 80 }}
    />
  );
}
