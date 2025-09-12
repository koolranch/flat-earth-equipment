import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS } from '@/app/training/oshaBasics';

export default function Module4OSHA() {
  return (
    <OshaBasicsCard
      title={OSHA_BASICS.m4.title}
      bullets={OSHA_BASICS.m4.bullets.map(text => ({ text }))}
      tip={OSHA_BASICS.m4.note}
      testId="osha-m4"
    />
  );
}
