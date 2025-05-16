import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telehandler Rentals | Flat Earth Equipment",
  description: "Rent high-quality telehandlers for your construction and material handling needs. Available in Wyoming, Montana, and New Mexico.",
};

export default function TelehandlerLayout({
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