"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const features = [
  {
    title: "Fast Shipping",
    icon: "/icons/truck.svg",
    description: "Same-day dispatch throughout WY, MT & NM.",
  },
  {
    title: "OEM Quality",
    icon: "/icons/wrench.svg",
    description: "Genuine Curtis, Yale, Hyster & more.",
  },
  {
    title: "24/7 Support",
    icon: "/icons/chat.svg",
    description: "Expert help whenever you need it.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 space-y-8 text-center">
        <h2 className="text-3xl font-heading">Why Choose Us?</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader className="flex flex-col items-center space-y-2">
                <Image src={f.icon} alt={f.title} width={48} height={48} />
                <CardTitle>{f.title}</CardTitle>
              </CardHeader>
              <CardContent>{f.description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 