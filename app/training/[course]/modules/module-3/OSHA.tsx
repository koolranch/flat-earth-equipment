import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';

export default function Module3OSHA() {
  return (
    <OshaBasicsCard
      title={OSHA_BASICS.m3.title}
      bullets={OSHA_BASICS.m3.bullets.map(text => ({ text }))}
      tip={OSHA_BASICS.m3.note}
      testId="osha-m3"
    />
  );
}
