'use client';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import { OSHAContentModule4 } from '@/components/training/osha/Module4';
import { Module4Practice } from '@/components/training/practice/Module4Practice';
import flashCards from '@/content/training/forklift-operator/module-4/flashcards.json';

export default function Page(){
  return (
    <TabbedModuleLayout
      courseSlug='forklift_operator'
      moduleSlug='module_4_hazards'
      title='Module 4: Hazard Hunt'
      nextHref='/training/forklift-operator/module-5'
      flashCards={flashCards}
      osha={<OSHAContentModule4 />}
      practice={({onComplete}) => <Module4Practice onComplete={onComplete} />}
      quizMeta={{ questions: 8, passPct: 80 }}
    />
  );
}
