"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

function QuoteForm() {
  const searchParams = useSearchParams();
  const prefilledSku = searchParams.get("sku") || "";
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    equipment: '',
    part: prefilledSku,
    qty: '',
    notes: ''
  });

  useEffect(() => {
    // Get locale from cookie on client side
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('lang='))
      ?.split('=')[1] as 'en' | 'es';
    setLocale(cookieLocale || 'en');
    
    // Update part field if prefilled SKU changes
    if (prefilledSku) {
      setFormData(prev => ({ ...prev, part: prefilledSku }));
    }
  }, [prefilledSku]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('https://api.usebasin.com/v1/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BASIN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject: 'Quote Request',
          form_name: 'quote_form'
        }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
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
        submit: 'Send Request',
        sending: 'Sending...'
      },
      error: 'Failed to send request. Please try again.'
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
        submit: 'Enviar Solicitud',
        sending: 'Enviando...'
      },
      error: 'Error al enviar solicitud. Por favor intente de nuevo.'
    }
  }[locale]

  if (status === 'success') {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-canyon-rust mb-4">{t.thankYou}</h1>
        <p className="text-slate-600">{t.followUp}</p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-4 text-canyon-rust underline"
        >
          Submit another request
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">{t.title}</h1>
      
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {t.error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t.form.name}
          required
          disabled={status === 'loading'}
          autoComplete="name"
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />
        <input
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder={t.form.company}
          disabled={status === 'loading'}
          autoComplete="organization"
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t.form.email}
          required
          disabled={status === 'loading'}
          autoComplete="email"
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />
        <input
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder={t.form.phone}
          disabled={status === 'loading'}
          autoComplete="tel"
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />

        <input
          name="equipment"
          value={formData.equipment}
          onChange={handleChange}
          placeholder={t.form.equipment}
          disabled={status === 'loading'}
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />
        <input
          name="part"
          value={formData.part}
          onChange={handleChange}
          placeholder={t.form.part}
          required
          disabled={status === 'loading'}
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />
        <input
          name="qty"
          type="number"
          value={formData.qty}
          onChange={handleChange}
          placeholder={t.form.qty}
          disabled={status === 'loading'}
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder={t.form.notes}
          rows={4}
          disabled={status === 'loading'}
          className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition w-full disabled:opacity-50"
        >
          {status === 'loading' ? t.form.sending : t.form.submit}
        </button>
      </form>
    </main>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto px-4 py-16 text-center">Loading...</div>}>
      <QuoteForm />
    </Suspense>
  );
} 