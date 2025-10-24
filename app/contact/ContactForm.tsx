"use client";
import { useState, useEffect } from "react";

export default function ContactForm() {
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    // Get locale from cookie on client side
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('lang='))
      ?.split('=')[1] as 'en' | 'es';
    setLocale(cookieLocale || 'en');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('https://api.usebasin.com/v1/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BASIN_API_KEY || 'fb0e195001565085399383d6996c0ab1'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject: 'Contact Form Submission',
          form_name: 'contact_form'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
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
      title: 'Contact Us',
      intro: 'Need help with a part, quote, or order? We\'re based in Sheridan, Wyoming and respond fast — usually within the hour during business hours.',
      corporateOffice: 'Corporate Office',
      support: 'Support',
      email: 'Email:',
      phone: 'Phone:',
      hours: 'Hours: Monday–Friday, 7AM–5PM (Mountain Time)',
      form: {
        name: 'Your Name',
        email: 'Email',
        message: 'How can we help you?',
        submit: 'Send Message',
        sending: 'Sending...'
      },
      success: 'Message sent successfully! We\'ll get back to you soon.',
      error: 'Failed to send message. Please try again.'
    },
    es: {
      title: 'Contáctanos',
      intro: '¿Necesita ayuda con una parte, cotización o pedido? Estamos ubicados en Sheridan, Wyoming y respondemos rápido — generalmente dentro de la hora durante el horario de oficina.',
      corporateOffice: 'Oficina Corporativa',
      support: 'Soporte',
      email: 'Correo electrónico:',
      phone: 'Teléfono:',
      hours: 'Horario: Lunes–Viernes, 7AM–5PM (Hora de la Montaña)',
      form: {
        name: 'Su Nombre',
        email: 'Correo Electrónico',
        message: '¿Como podemos ayudarle?',
        submit: 'Enviar Mensaje',
        sending: 'Enviando...'
      },
      success: '¡Mensaje enviado exitosamente! Nos pondremos en contacto pronto.',
      error: 'Error al enviar mensaje. Por favor intente de nuevo.'
    }
  }[locale]

  if (status === 'success') {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">✅ {t.success}</h1>
        <button 
          onClick={() => setStatus('idle')}
          className="text-canyon-rust underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">{t.title}</h1>
      <p className="text-slate-600 mb-8">
        {t.intro}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Contact Info */}
        <div className="text-slate-700 text-sm space-y-4">
          <div>
            <h2 className="font-semibold text-base text-slate-800 mb-1">{t.corporateOffice}</h2>
            <p>30 N Gould St., Ste R<br />Sheridan, WY 82801</p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-slate-800 mb-1">{t.support}</h2>
            <p>{t.email} <a href="mailto:contact@flatearthequipment.com" className="text-canyon-rust underline">contact@flatearthequipment.com</a></p>
            <p>{t.hours}</p>
          </div>
        </div>

        {/* Right: Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {t.error}
            </div>
          )}
          
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t.form.name}
            required
            disabled={status === 'loading'}
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
            className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={t.form.message}
            rows={5}
            required
            disabled={status === 'loading'}
            className="w-full border border-slate-300 px-4 py-2 rounded disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition disabled:opacity-50"
          >
            {status === 'loading' ? t.form.sending : t.form.submit}
          </button>
        </form>
      </div>
    </>
  );
} 