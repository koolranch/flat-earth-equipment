import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';
import { completeStep } from '@/lib/trainingProgress';
import { useModuleTabs } from '@/hooks/useModuleTabs';

interface Props {
  onContinue?: () => void;
}

const COURSE_ID = 'forklift_operator';
const MODULE_KEY = 'm4';

export default function Module4OSHA(props: Props) {
  const { setActiveTab } = useModuleTabs('osha');
  
  const handleContinue = async () => {
    try {
      await completeStep(COURSE_ID, MODULE_KEY as any, 'osha');
      setActiveTab('practice');
      props?.onContinue?.();
    } catch {}
  };

  return (
    <main className="space-y-4">
      <OshaBasicsCard
        title={OSHA_BASICS.m4.title}
        bullets={OSHA_BASICS.m4.bullets.map(text => ({ text }))}
        tip={OSHA_BASICS.m4.note}
        ctaLabel="Continue to Practice"
        onContinue={handleContinue}
        testId="osha-m4"
        continueTestId="m4-osha-continue"
      />
    </main>
  );
}
