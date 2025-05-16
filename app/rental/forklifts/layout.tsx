import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forklift Rentals | Flat Earth Equipment",
  description: "Rent high-quality forklifts for your material handling needs. Available in Wyoming, Montana, and New Mexico.",
};

export default function ForkliftLayout({
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