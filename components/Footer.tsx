'use client';

import { useState } from 'react';
import Link from 'next/link';
import MobileAppBadges from './MobileAppBadges';

export default function Footer({ locale = 'en' }: { locale?: 'en' | 'es' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const es = locale === 'es';

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
          email,
          subject: 'New Email Signup',
          form_name: 'footer_signup'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-[#F9F7F3] text-[#2D2D2D]">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Column - Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">Flat Earth Equipment</div>
            <p className="text-slate-600 text-sm">
              {es
                ? 'Flat Earth Equipment ofrece partes industriales de ajuste preciso, rentas listas para trabajar y capacitación de seguridad para montacargas en todo Estados Unidos.'
                : 'Flat Earth Equipment is built Western tough — precision-fit industrial parts and dispatch-ready rentals, shipped nationwide.'}
            </p>
          </div>

          {/* Center Column - Shop Categories (drives sitewide SEO authority to top product hubs) */}
          <div>
            <h3 className="font-semibold mb-4">{es ? 'Comprar' : 'Shop'}</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/parts" className="hover:text-canyon-rust transition">{es ? 'Todas las partes' : 'All Parts'}</Link></li>
              <li><Link href="/lithium-batteries" className="hover:text-canyon-rust transition">{es ? 'Baterías de litio para carritos de golf' : 'Lithium Golf Cart Batteries'}</Link></li>
              <li><Link href="/charger-modules" className="hover:text-canyon-rust transition">{es ? 'Módulos de cargador para montacargas' : 'Forklift Charger Modules'}</Link></li>
              <li><Link href="/battery-chargers" className="hover:text-canyon-rust transition">{es ? 'Cargadores de batería' : 'Battery Chargers'}</Link></li>
              <li><Link href={es ? "/es/safety" : "/safety/forklift"} className="hover:text-canyon-rust transition">{es ? 'Capacitación de seguridad para montacargas' : 'Forklift Safety Training'}</Link></li>
              <li><Link href="/insights" className="hover:text-canyon-rust transition">{es ? 'Guías y artículos' : 'Insights & Guides'}</Link></li>
              <li><Link href="/about" className="hover:text-canyon-rust transition">{es ? 'Sobre nosotros' : 'About Us'}</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-canyon-rust transition">{es ? 'Envíos y devoluciones' : 'Shipping & Returns'}</Link></li>
              <li><Link href="/warranty" className="hover:text-canyon-rust transition">{es ? 'Garantía' : 'Warranty'}</Link></li>
              <li><Link href="/contact" className="hover:text-canyon-rust transition">{es ? 'Contacto' : 'Contact'}</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-canyon-rust transition">{es ? 'Términos de servicio' : 'Terms of Service'}</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-canyon-rust transition">{es ? 'Política de privacidad' : 'Privacy Policy'}</Link></li>
            </ul>
            <MobileAppBadges className="mt-6 space-y-2" locale={locale} />
          </div>

          {/* Service Areas Column */}
          <div>
            <h3 className="font-semibold mb-4">
              <Link href="/locations" className="hover:text-canyon-rust transition">{es ? 'Áreas de servicio' : 'Service Areas'}</Link>
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/texas/dallas-fort-worth" className="hover:text-canyon-rust transition">Dallas-Fort Worth, TX</Link></li>
              <li><Link href="/texas/houston" className="hover:text-canyon-rust transition">Houston, TX</Link></li>
              <li><Link href="/texas/el-paso" className="hover:text-canyon-rust transition">El Paso, TX</Link></li>
              <li><Link href="/arizona/phoenix" className="hover:text-canyon-rust transition">Phoenix, AZ</Link></li>
              <li><Link href="/colorado/denver" className="hover:text-canyon-rust transition">Denver, CO</Link></li>
              <li><Link href="/colorado/pueblo" className="hover:text-canyon-rust transition">Pueblo, CO</Link></li>
              <li><Link href="/new-mexico/albuquerque" className="hover:text-canyon-rust transition">Albuquerque, NM</Link></li>
              <li><Link href="/new-mexico/las-cruces" className="hover:text-canyon-rust transition">Las Cruces, NM</Link></li>
              <li><Link href="/montana/bozeman" className="hover:text-canyon-rust transition">Bozeman, MT</Link></li>
              <li><Link href="/wyoming/cheyenne" className="hover:text-canyon-rust transition">Cheyenne, WY</Link></li>
            </ul>
          </div>

          {/* Right Column - Email Signup */}
          <div>
            <h3 className="font-semibold mb-4">{es ? 'Recibe novedades' : 'Stay Updated'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={es ? 'Tu correo electrónico' : 'Your email'}
                required
                autoComplete="email"
                className="w-full px-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A0522D]/20"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-4 py-2 bg-[#A0522D] text-white rounded-lg hover:bg-[#A0522D]/90 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? (es ? 'Registrando...' : 'Signing up...') : (es ? 'Registrarme' : 'Sign Up')}
              </button>
            </form>
            {status === 'success' && (
              <p className="mt-2 text-sm text-green-600">{es ? 'Gracias por registrarte.' : 'Thanks for signing up!'}</p>
            )}
            {status === 'error' && (
              <p className="mt-2 text-sm text-red-600">{es ? 'Algo salió mal. Inténtalo de nuevo.' : 'Something went wrong. Please try again.'}</p>
            )}
          </div>
        </div>

        {/* Base Bar - Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-sm text-slate-600 text-center md:text-left">
            © {new Date().getFullYear()} Flat Earth Equipment. {es ? 'Todos los derechos reservados.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
} 