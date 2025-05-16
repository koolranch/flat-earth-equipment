import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Construction Equipment Parts | Flat Earth Equipment",
  description: "Find high-quality replacement parts for your construction equipment. Expert guidance and fast shipping.",
};

export default function ConstructionEquipmentPartsLayout({
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