import { Metadata } from 'next';
import { getUserLocale } from '@/lib/getUserLocale';
import { generatePageAlternates } from '@/app/seo-defaults';

export const metadata: Metadata = {
  title: 'Privacy Policy | Flat Earth Equipment',
  description: 'Learn how Flat Earth Equipment collects, uses, and protects your personal information.',
  alternates: generatePageAlternates('/policies/privacy-policy'),
};

export default function PrivacyPolicyPage() {
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      title: 'Privacy Policy',
      infoWeCollect: {
        title: '1. Information We Collect',
        description: 'We collect information that you provide directly to us, including:',
        items: [
          'Name and contact information',
          'Company information', 
          'Order history and preferences',
          'Payment information'
        ]
      },
      howWeUse: {
        title: '2. How We Use Your Information',
        description: 'We use the information we collect to:',
        items: [
          'Process your orders and payments',
          'Communicate with you about your orders',
          'Send you marketing communications (with your consent)',
          'Improve our website and services'
        ]
      },
      infoSharing: {
        title: '3. Information Sharing',
        description: 'We do not sell your personal information. We may share your information with:',
        items: [
          'Service providers who assist in our operations',
          'Payment processors for secure transactions',
          'Shipping partners to deliver your orders'
        ]
      },
      askEmployer: {
        title: '4. Asking Your Employer to Pay',
        description: 'If you use the "Ask your employer to pay" feature in our mobile app, we collect the employer name and email address you provide, along with an optional message. We use this information solely to send a one-time email to the employer on your behalf. We do not share it with third parties or use it for marketing. We retain these records for 7 years to comply with business records retention requirements tied to financial transactions. Each of the following is optional, encrypted in transit, retained 7 years, and not shared with third parties beyond the named employer:',
        items: [
          'Employer name (when you use the ask-employer feature)',
          'Employer email address (when you use the ask-employer feature)',
          'Optional message text (when you use the ask-employer feature)'
        ]
      },
      yourRights: {
        title: '5. Your Rights',
        description: 'You have the right to:',
        items: [
          'Access your personal information',
          'Correct inaccurate information',
          'Request deletion of your information',
          'Opt-out of marketing communications'
        ]
      },
      contact: {
        title: '6. Contact Us',
        description: 'If you have any questions about our Privacy Policy, please contact us:',
        items: [
          'Email: privacy@flatearthequipment.com',
          'Phone: (555) 123-4567',
          'Address: 123 Business Street, City, State 12345'
        ]
      }
    },
    es: {
      title: 'Política de Privacidad',
      infoWeCollect: {
        title: '1. Información que Recopilamos',
        description: 'Recopilamos información que usted nos proporciona directamente, incluyendo:',
        items: [
          'Nombre e información de contacto',
          'Información de la empresa',
          'Historial de pedidos y preferencias',
          'Información de pago'
        ]
      },
      howWeUse: {
        title: '2. Cómo Usamos su Información',
        description: 'Usamos la información que recopilamos para:',
        items: [
          'Procesar sus pedidos y pagos',
          'Comunicarnos con usted sobre sus pedidos',
          'Enviarle comunicaciones de marketing (con su consentimiento)',
          'Mejorar nuestro sitio web y servicios'
        ]
      },
      infoSharing: {
        title: '3. Compartir Información',
        description: 'No vendemos su información personal. Podemos compartir su información con:',
        items: [
          'Proveedores de servicios que nos asisten en nuestras operaciones',
          'Procesadores de pagos para transacciones seguras',
          'Socios de envío para entregar sus pedidos'
        ]
      },
      askEmployer: {
        title: '4. Pedirle a su Empleador que Pague',
        description: 'Si utiliza la función "Pídale a su empleador que pague" en nuestra aplicación móvil, recopilamos el nombre y la dirección de correo electrónico del empleador que usted proporciona, junto con un mensaje opcional. Usamos esta información únicamente para enviar un correo electrónico único al empleador en su nombre. No la compartimos con terceros ni la usamos con fines de marketing. Conservamos estos registros durante 7 años para cumplir con los requisitos de retención de registros comerciales asociados con transacciones financieras. Cada uno de los siguientes datos es opcional, cifrado en tránsito, retenido durante 7 años y no compartido con terceros más allá del empleador designado:',
        items: [
          'Nombre del empleador (cuando utiliza la función de pedirle a su empleador)',
          'Dirección de correo electrónico del empleador (cuando utiliza la función de pedirle a su empleador)',
          'Texto de mensaje opcional (cuando utiliza la función de pedirle a su empleador)'
        ]
      },
      yourRights: {
        title: '5. Sus Derechos',
        description: 'Usted tiene el derecho a:',
        items: [
          'Acceder a su información personal',
          'Corregir información inexacta',
          'Solicitar la eliminación de su información',
          'Optar por no recibir comunicaciones de marketing'
        ]
      },
      contact: {
        title: '6. Contáctanos',
        description: 'Si tiene alguna pregunta sobre nuestra Política de Privacidad, por favor contáctenos:',
        items: [
          'Correo electrónico: privacy@flatearthequipment.com',
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
        <h2 className="text-2xl font-semibold mb-4">{t.infoWeCollect.title}</h2>
        <div className="prose prose-slate">
          <p>{t.infoWeCollect.description}</p>
          <ul>
            {t.infoWeCollect.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t.howWeUse.title}</h2>
        <div className="prose prose-slate">
          <p>{t.howWeUse.description}</p>
          <ul>
            {t.howWeUse.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t.infoSharing.title}</h2>
        <div className="prose prose-slate">
          <p>{t.infoSharing.description}</p>
          <ul>
            {t.infoSharing.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t.askEmployer.title}</h2>
        <div className="prose prose-slate">
          <p>{t.askEmployer.description}</p>
          <ul>
            {t.askEmployer.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t.yourRights.title}</h2>
        <div className="prose prose-slate">
          <p>{t.yourRights.description}</p>
          <ul>
            {t.yourRights.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
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