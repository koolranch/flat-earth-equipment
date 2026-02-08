import { Metadata } from 'next';
import { getUserLocale } from '@/lib/getUserLocale';
import { generatePageAlternates } from '@/app/seo-defaults';

export const metadata: Metadata = {
  title: 'Terms of Service | Flat Earth Equipment',
  description: 'Read our terms of service and conditions for using Flat Earth Equipment\'s website and services.',
  alternates: generatePageAlternates('/policies/terms-of-service'),
};

export default function TermsOfServicePage() {
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      title: 'Terms of Service',
      acceptance: {
        title: '1. Acceptance of Terms',
        content: 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.'
      },
      license: {
        title: '2. Use License',
        content1: 'Permission is granted to temporarily download one copy of the materials (information or software) on Flat Earth Equipment\'s website for personal, non-commercial transitory viewing only.',
        content2: 'This is the grant of a license, not a transfer of title, and under this license you may not:',
        items: [
          'Modify or copy the materials',
          'Use the materials for any commercial purpose',
          'Attempt to decompile or reverse engineer any software contained on the website',
          'Remove any copyright or other proprietary notations from the materials'
        ]
      },
      disclaimer: {
        title: '3. Disclaimer',
        content: 'The materials on Flat Earth Equipment\'s website are provided on an \'as is\' basis. Flat Earth Equipment makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
      },
      limitations: {
        title: '4. Limitations',
        content: 'In no event shall Flat Earth Equipment or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Flat Earth Equipment\'s website.'
      },
      contact: {
        title: '5. Contact Information',
        description: 'If you have any questions about these Terms of Service, please contact us:',
        items: [
          'Email: legal@flatearthequipment.com',
          'Phone: (555) 123-4567',
          'Address: 123 Business Street, City, State 12345'
        ]
      }
    },
    es: {
      title: 'Términos de Servicio',
      acceptance: {
        title: '1. Aceptación de Términos',
        content: 'Al acceder y usar este sitio web, usted acepta y acuerda estar sujeto a los términos y disposiciones de este acuerdo.'
      },
      license: {
        title: '2. Licencia de Uso',
        content1: 'Se otorga permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web de Flat Earth Equipment solo para visualización personal, no comercial y transitoria.',
        content2: 'Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia usted no puede:',
        items: [
          'Modificar o copiar los materiales',
          'Usar los materiales para cualquier propósito comercial',
          'Intentar decompilar o hacer ingeniería inversa de cualquier software contenido en el sitio web',
          'Eliminar cualquier notación de derechos de autor u otras notaciones de propiedad de los materiales'
        ]
      },
      disclaimer: {
        title: '3. Descargo de Responsabilidad',
        content: 'Los materiales en el sitio web de Flat Earth Equipment se proporcionan "tal como están". Flat Earth Equipment no hace garantías, expresas o implícitas, y por la presente rechaza y niega todas las demás garantías, incluyendo, sin limitación, garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular, o no infracción de propiedad intelectual u otra violación de derechos.'
      },
      limitations: {
        title: '4. Limitaciones',
        content: 'En ningún evento Flat Earth Equipment o sus proveedores serán responsables por cualquier daño (incluyendo, sin limitación, daños por pérdida de datos o ganancias, o debido a interrupción del negocio) que surja del uso o la incapacidad de usar los materiales en el sitio web de Flat Earth Equipment.'
      },
      contact: {
        title: '5. Información de Contacto',
        description: 'Si tiene alguna pregunta sobre estos Términos de Servicio, por favor contáctenos:',
        items: [
          'Correo electrónico: legal@flatearthequipment.com',
          'Teléfono: (555) 123-4567',
          'Dirección: 123 Business Street, City, State 12345'
        ]
      }
    }
  }[locale]

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">{t.title}</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t.acceptance.title}</h2>
        <div className="prose prose-slate">
          <p>{t.acceptance.content}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t.license.title}</h2>
        <div className="prose prose-slate">
          <p>{t.license.content1}</p>
          <p>{t.license.content2}</p>
          <ul>
            {t.license.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t.disclaimer.title}</h2>
        <div className="prose prose-slate">
          <p>{t.disclaimer.content}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t.limitations.title}</h2>
        <div className="prose prose-slate">
          <p>{t.limitations.content}</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">{t.contact.title}</h2>
        <div className="prose prose-slate">
          <p>{t.contact.description}</p>
          <ul>
            {t.contact.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
} 