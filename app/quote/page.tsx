"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

function QuoteForm() {
  const searchParams = useSearchParams();
  const prefilledSku = searchParams.get("sku") || "";
  const [submitted, setSubmitted] = useState(false);
  const [locale, setLocale] = useState<'en' | 'es'>('en');

  useEffect(() => {
    // Get locale from cookie on client side
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('lang='))
      ?.split('=')[1] as 'en' | 'es';
    setLocale(cookieLocale || 'en');
  }, []);
  
  // Translation strings
  const t = {
    en: {
      title: 'Request a Quote',
      thankYou: 'Thanks for your request!',
      followUp: 'We\'ll review your info and get back to you shortly.',
      loading: 'Loading...',
      form: {
        name: 'Your Name',
        company: 'Company (optional)',
        email: 'Email',
        phone: 'Phone (optional)',
        equipment: 'Make & Model (e.g. JLG 1930ES)',
        part: 'Part Number or Description',
        qty: 'Quantity (optional)',
        notes: 'Additional notes (fitment details, needed by date, etc.)',
        submit: 'Send Request'
      }
    },
    es: {
      title: 'Solicitar Cotización',
      thankYou: '¡Gracias por su solicitud!',
      followUp: 'Revisaremos su información y nos pondremos en contacto pronto.',
      loading: 'Cargando...',
      form: {
        name: 'Su Nombre',
        company: 'Empresa (opcional)',
        email: 'Correo Electrónico',
        phone: 'Teléfono (opcional)',
        equipment: 'Marca y Modelo (ej. JLG 1930ES)',
        part: 'Número de Parte o Descripción',
        qty: 'Cantidad (opcional)',
        notes: 'Notas adicionales (detalles de ajuste, fecha requerida, etc.)',
        submit: 'Enviar Solicitud'
      }
    }
  }[locale]

  if (submitted) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-canyon-rust mb-4">{t.thankYou}</h1>
        <p className="text-slate-600">{t.followUp}</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">{t.title}</h1>
      <form
        method="POST"
        action="https://formspree.io/f/xvgroloy"
        onSubmit={() => setSubmitted(true)}
        className="space-y-4"
      >
        <input type="hidden" name="_subject" value="New Quote Request" />

        <input
          name="name"
          placeholder={t.form.name}
          required
          autoComplete="name"
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />
        <input
          name="company"
          placeholder={t.form.company}
          autoComplete="organization"
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />
        <input
          name="email"
          type="email"
          placeholder={t.form.email}
          required
          autoComplete="email"
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />
        <input
          name="phone"
          type="tel"
          placeholder={t.form.phone}
          autoComplete="tel"
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />

        <input
          name="equipment"
          placeholder={t.form.equipment}
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />
        <input
          name="part"
          placeholder={t.form.part}
          defaultValue={prefilledSku}
          required
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />
        <input
          name="qty"
          type="number"
          placeholder={t.form.qty}
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />

        <textarea
          name="notes"
          placeholder={t.form.notes}
          rows={4}
          className="w-full border border-slate-300 px-4 py-2 rounded"
        />

        <button
          type="submit"
          className="bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition w-full"
        >
          {t.form.submit}
        </button>
      </form>
    </main>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuoteForm />
    </Suspense>
  );
} 