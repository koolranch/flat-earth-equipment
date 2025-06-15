"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export function Features({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  
  const t = {
    en: {
      title: "Why Choose Us",
      features: [
        {
          title: "Precision-Fit Parts",
          description: "Built for uptime and fitment accuracy — no guesswork.",
        },
        {
          title: "Same-Day Shipping", 
          description: "Fast fulfillment and delivery anywhere in the U.S.",
        },
        {
          title: "Western Tough Support",
          description: "We're technicians, not ticket bots. Real answers, fast.",
        },
      ]
    },
    es: {
      title: "Por Qué Elegirnos",
      features: [
        {
          title: "Partes de Ajuste Preciso",
          description: "Construidas para tiempo de actividad y precisión de ajuste — sin conjeturas.",
        },
        {
          title: "Envío el Mismo Día",
          description: "Cumplimiento rápido y entrega en cualquier lugar de EE.UU.",
        },
        {
          title: "Soporte Resistente del Oeste",
          description: "Somos técnicos, no bots de tickets. Respuestas reales, rápidas.",
        },
      ]
    }
  }[locale]

  return (
    <div className="container mx-auto px-4">
      <h2 className="font-teko text-3xl font-bold text-center mb-12">{t.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {t.features.map((feature, index) => (
          <div key={feature.title} className="text-center">
            <div className="w-12 h-12 bg-[#A0522D] text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {index === 0 && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                )}
                {index === 1 && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                )}
                {index === 2 && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                )}
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 