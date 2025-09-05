'use client';
import dynamic from 'next/dynamic';
const DashboardInner = dynamic(() => import('./_DashboardInner'), { ssr: false });

export default function TrainerDashboard() { 
  return <DashboardInner />; 
}
