import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';

export default function Module1OSHA() {
  return (
    <OshaBasicsCard
      title={OSHA_BASICS.m1.title}
      bullets={OSHA_BASICS.m1.bullets.map(text => ({ text }))}
      tip={OSHA_BASICS.m1.note}
      testId="osha-m1"
    />
  );
}
