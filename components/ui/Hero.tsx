"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface HeroSlide {
  id: string;
  badge: { emoji: string; label: string; highlight: string };
  headline: string;
  subtext: string;
  pricing?: { original: string; current: string };
  cta: { text: string; href: string };
  trustSignals: string[];
  backgroundImage: string;
  secondaryLink?: { text: string; href: string; label: string };
}

export function Hero({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides: HeroSlide[] = locale === 'en' ? [
    // SLIDE 1: RENTALS (PRIMARY)
    {
      id: 'rentals',
      badge: { emoji: '🚜', label: 'RENTALS', highlight: 'Flexible Terms' },
      headline: 'Rent Heavy Equipment for Any Job',
      subtext: 'Forklifts • Scissor Lifts • Telehandlers • Loaders',
      cta: { text: 'Browse Rental Fleet →', href: '/rent-equipment' },
      trustSignals: ['Delivery Available', 'Short & Long Term', 'Well-Maintained Fleet'],
      backgroundImage: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp',
      secondaryLink: { label: 'Need a quote?', text: 'Request pricing →', href: '/quote' }
    },
    // SLIDE 2: OSHA TRAINING (SECONDARY)
    {
      id: 'safety',
      badge: { emoji: '🎓', label: 'TRAINING', highlight: 'Save $10' },
      headline: 'Get Forklift Certified in Under 30 Minutes',
      subtext: 'OSHA-compliant • 100% online',
      pricing: { original: '$59', current: '$49' },
      cta: { text: 'Start Certification — $49 →', href: '/safety' },
      trustSignals: ['OSHA 1910.178', 'All 50 States', 'Instant Certificate'],
      backgroundImage: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp',
      secondaryLink: { label: 'Need parts or rentals?', text: 'Browse equipment →', href: '/parts' }
    }
  ] : [
    // SPANISH - SLIDE 1: RENTALS (PRIMARY)
    {
      id: 'rentals',
      badge: { emoji: '🚜', label: 'ALQUILERES', highlight: 'Términos Flexibles' },
      headline: 'Alquile Equipo Pesado para Cualquier Trabajo',
      subtext: 'Montacargas • Tijeras • Telehandlers • Cargadores',
      cta: { text: 'Ver Flota de Alquiler →', href: '/rent-equipment' },
      trustSignals: ['Entrega Disponible', 'Corto y Largo Plazo', 'Flota Bien Mantenida'],
      backgroundImage: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp',
      secondaryLink: { label: '¿Necesita cotización?', text: 'Solicitar precios →', href: '/quote' }
    },
    // SPANISH - SLIDE 2: OSHA TRAINING (SECONDARY)
    {
      id: 'safety',
      badge: { emoji: '🎓', label: 'CAPACITACIÓN', highlight: 'Ahorre $10' },
      headline: 'Obtenga Certificación de Montacargas en Menos de 30 Minutos',
      subtext: 'Cumple con OSHA • 100% en línea',
      pricing: { original: '$59', current: '$49' },
      cta: { text: 'Comenzar Certificación — $49 →', href: '/safety' },
      trustSignals: ['OSHA 1910.178', 'Los 50 Estados', 'Certificado Instantáneo'],
      backgroundImage: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp',
      secondaryLink: { label: '¿Necesita partes o alquileres?', text: 'Ver equipos →', href: '/parts' }
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section 
      className="relative h-[500px] md:h-[600px] w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background images with fade transition */}
      {slides.map((s, index) => (
        <img
          key={s.id}
          src={s.backgroundImage}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Dark overlay - slightly different tint per slide type */}
      <div className={`absolute inset-0 transition-colors duration-700 ${
        slide.id === 'rentals' 
          ? 'bg-gradient-to-r from-slate-900/85 to-slate-800/50' 
          : 'bg-gradient-to-r from-black/80 to-black/40'
      }`}></div>

      {/* Content with fade animation */}
      <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
        <div className="max-w-xl mx-auto">
          {/* Badge */}
          <div 
            key={`badge-${slide.id}`}
            className={`inline-flex items-center gap-2 backdrop-blur-sm border px-4 py-2 rounded-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
              slide.id === 'rentals'
                ? 'bg-gradient-to-r from-blue-500/20 to-slate-500/20 border-blue-400/30'
                : 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400/30'
            }`}
          >
            <span className={`text-xs font-bold ${slide.id === 'rentals' ? 'text-blue-300' : 'text-orange-300'}`}>
              {slide.badge.emoji} {slide.badge.label}
            </span>
            <span className="text-xs text-white/80">•</span>
            <span className="text-xs text-emerald-300 font-semibold">{slide.badge.highlight}</span>
          </div>
          
          {/* Headline */}
          <h1 
            key={`headline-${slide.id}`}
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight animate-in fade-in slide-in-from-bottom-3 duration-500"
          >
            {slide.headline}
          </h1>
          
          {/* Subtext with optional pricing */}
          <p 
            key={`subtext-${slide.id}`}
            className="text-white/90 text-lg mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {slide.subtext}
            {slide.pricing && (
              <>
                {' • '}
                <span className="inline-flex items-baseline gap-1.5">
                  <span className="text-white/60 line-through text-base">{slide.pricing.original}</span>
                  <span className="font-bold text-white text-xl">{slide.pricing.current}</span>
                </span>
              </>
            )}
          </p>
          
          {/* CTA Button */}
          <Link
            key={`cta-${slide.id}`}
            href={slide.cta.href}
            className={`inline-block w-full sm:w-auto text-white px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-2xl mb-6 animate-in fade-in slide-in-from-bottom-5 duration-500 ${
              slide.id === 'rentals'
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/50'
                : 'bg-orange-500 hover:bg-orange-600 hover:shadow-orange-500/50'
            }`}
          >
            {slide.cta.text}
          </Link>
          
          {/* Trust Signals */}
          <div 
            key={`signals-${slide.id}`}
            className="flex flex-wrap justify-center gap-4 text-sm text-white/90 mb-4 animate-in fade-in duration-700"
          >
            {slide.trustSignals.map((signal, i) => (
              <span key={i} className="flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                {signal}
              </span>
            ))}
          </div>
          
          {/* Secondary Link */}
          {slide.secondaryLink && (
            <p className="text-sm text-white/60 animate-in fade-in duration-700">
              {slide.secondaryLink.label}{' '}
              <Link href={slide.secondaryLink.href} className="underline hover:text-white">
                {slide.secondaryLink.text}
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((s, index) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? `w-8 ${s.id === 'rentals' ? 'bg-blue-500' : 'bg-orange-500'}` 
                : 'w-3 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to ${s.id} slide`}
          />
        ))}
      </div>

      {/* Slide indicator labels */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex gap-6 text-xs text-white/60">
        {slides.map((s, index) => (
          <button
            key={`label-${s.id}`}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all ${index === currentSlide ? 'text-white font-semibold' : 'hover:text-white/80'}`}
          >
            {s.id === 'rentals' ? (locale === 'en' ? 'Rentals' : 'Alquileres') : (locale === 'en' ? 'Training' : 'Capacitación')}
          </button>
        ))}
      </div>
    </section>
  );
}
