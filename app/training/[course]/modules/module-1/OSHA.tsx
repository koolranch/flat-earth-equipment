import React from 'react';
import OshaBasicsCard from '@/components/training/OshaBasicsCard';
import { OSHA_BASICS, getOSHABasics } from '@/app/training/oshaBasics';

export default function Module1OSHA() {
  // Safe locale-aware content loading with fallback
  const content = getOSHABasics('m1') || OSHA_BASICS.m1; // Double fallback for safety
  
  return (
    <OshaBasicsCard
      title={content.title}
      bullets={content.bullets.map(text => ({ text }))}
      tip={content.note}
      testId="osha-m1"
    />
  );
}
