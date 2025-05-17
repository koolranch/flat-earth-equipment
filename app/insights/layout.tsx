import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Flat Earth Equipment",
    default: "Equipment Insights | Flat Earth Equipment",
  },
  description: "Expert insights and guides for industrial equipment maintenance, repair, and operation.",
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
} 