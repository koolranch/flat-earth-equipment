"use client";
import { useState, useEffect } from "react";

type Locale = 'en' | 'es';

export default function StickyBottomCTA({ locale = 'en' }: { locale?: Locale }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 100px
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = {
    en: {
      cta: "Get Your Module →",
      subtitle: "6-month warranty • Same-day dispatch"
    },
    es: {
      cta: "Obtén Tu Módulo →",
      subtitle: "Garantía de 6 meses • Envío el mismo día"
    }
  }[locale];

  const scrollToCards = () => {
    const cardsSection = document.querySelector('section[class*="grid"]');
    if (cardsSection) {
      cardsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden">
      <div className="bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-600">{t.subtitle}</p>
          </div>
          <button
            onClick={scrollToCards}
            className="bg-canyon-rust text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-canyon-rust/90 transition-colors"
          >
            {t.cta}
          </button>
        </div>
      </div>
    </div>
  );
} 