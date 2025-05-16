import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aerial Equipment Parts | Flat Earth Equipment",
  description: "High-quality replacement parts and expert guidance for aerial equipment maintenance and repair.",
};

export default function AerialEquipmentLayout({
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