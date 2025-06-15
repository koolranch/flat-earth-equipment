import { Metadata } from "next";
import { getUserLocale } from '@/lib/getUserLocale';

export const metadata: Metadata = {
  title: "Contact Us | Flat Earth Equipment",
  description: "Get in touch with Flat Earth Equipment for parts inquiries, rentals, and support.",
  alternates: { canonical: '/contact' }
};

export default function ContactPage() {
  const locale = getUserLocale()
  
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
        submit: 'Send Message'
      }
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
        submit: 'Enviar Mensaje'
      }
    }
  }[locale]

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
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
            <p>{t.phone} <a href="tel:+13073020043" className="text-canyon-rust underline">(307) 302-0043‬</a></p>
            <p>{t.hours}</p>
          </div>
        </div>

        {/* Right: Contact Form */}
        <form
          method="POST"
          action="https://formspree.io/f/xvgroloy"
          className="space-y-4"
        >
          <input
            type="hidden"
            name="_subject"
            value="Contact Form Submission"
          />
          <input
            type="hidden"
            name="_next"
            value="https://www.flatearthequipment.com/contact/thank-you"
          />
          <input
            type="text"
            name="_gotcha"
            style={{ display: 'none' }}
          />
          <input
            name="name"
            placeholder={t.form.name}
            required
            className="w-full border border-slate-300 px-4 py-2 rounded"
          />
          <input
            name="email"
            type="email"
            placeholder={t.form.email}
            required
            className="w-full border border-slate-300 px-4 py-2 rounded"
          />
          <textarea
            name="message"
            placeholder={t.form.message}
            rows={5}
            required
            className="w-full border border-slate-300 px-4 py-2 rounded"
          />
          <button
            type="submit"
            className="bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
          >
            {t.form.submit}
          </button>
        </form>
      </div>
    </main>
  );
} 