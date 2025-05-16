import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Construction Equipment | Flat Earth Equipment",
  description: "Expert guidance and information about construction equipment, including skid steers, excavators, and more. Serving Wyoming, Montana, and New Mexico.",
};

export default function ConstructionEquipmentLayout({
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