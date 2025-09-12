import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';

export default function Module5OSHA() {
  return (
    <OshaBasicsCard
      title={OSHA_BASICS.m5.title}
      bullets={OSHA_BASICS.m5.bullets.map(text => ({ text }))}
      tip={OSHA_BASICS.m5.note}
      testId="osha-m5"
    />
  );
}
