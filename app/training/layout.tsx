import { ReactNode } from 'react';

// 2 minutes for mostly-static hub content
export const revalidate = 120;

export default function TrainingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
