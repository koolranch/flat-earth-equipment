import { ReactNode } from 'react';
import { Metadata } from 'next';

// 2 minutes for mostly-static hub content
export const revalidate = 120;

// The /training tree is the learner product (hub, modules, exam, checkout),
// not a marketing surface. /safety is the indexable certification landing
// page; noindexing here keeps course content out of search and stops
// /training from competing with /safety for certification queries.
// Crawl-directive only — no rendering, auth, or API behavior changes.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function TrainingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
