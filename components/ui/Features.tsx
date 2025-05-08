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
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-center mb-12">Why Choose Us</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Quality Parts</h3>
          <p className="text-gray-600">OEM and aftermarket parts from trusted manufacturers</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Fast Shipping</h3>
          <p className="text-gray-600">Same-day shipping across WY, MT, & NM</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Expert Support</h3>
          <p className="text-gray-600">Technical expertise and customer service</p>
        </div>
      </div>
    </div>
  );
} 