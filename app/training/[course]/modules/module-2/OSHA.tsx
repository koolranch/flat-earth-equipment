import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';

export default function Module2OSHA() {
  return (
    <OshaBasicsCard
      title={OSHA_BASICS.m2.title}
      bullets={OSHA_BASICS.m2.bullets.map(text => ({ text }))}
      tip={OSHA_BASICS.m2.note}
      testId="osha-m2"
    />
  );
}
