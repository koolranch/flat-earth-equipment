import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';
import { completeStep } from '@/lib/trainingProgress';
import { useModuleTabs } from '@/hooks/useModuleTabs';

interface Props {
  onContinue?: () => void;
}

const COURSE_ID = 'forklift_operator';
const MODULE_KEY = 'm5';

export default function Module5OSHA(props: Props) {
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
        title={OSHA_BASICS.m5.title}
        bullets={OSHA_BASICS.m5.bullets.map(text => ({ text }))}
        tip={OSHA_BASICS.m5.note}
        ctaLabel="Continue to Practice"
        onContinue={handleContinue}
        testId="osha-m5"
        continueTestId="m5-osha-continue"
      />
    </main>
  );
}
