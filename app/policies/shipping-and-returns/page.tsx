import { Metadata } from 'next';
import { getUserLocale } from '@/lib/getUserLocale';
import { generatePageAlternates } from '@/app/seo-defaults';

export const metadata: Metadata = {
  title: 'Shipping & Returns | Flat Earth Equipment',
  description: 'Learn about our shipping and returns policies for industrial equipment and parts.',
  alternates: generatePageAlternates('/policies/shipping-and-returns'),
};

export default function ShippingAndReturnsPage() {
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      title: 'Shipping & Returns Policy',
      shipping: {
        title: 'Shipping Information',
        intro: 'We ship in the United States. Freight is calculated at checkout.',
        methodsTitle: 'Shipping',
        methods: [
          'Freight is calculated at checkout',
          'Checkout is limited to United States shipping addresses'
        ],
        costs: 'Freight is calculated at checkout from the part and the ship-to address.'
      },
      returns: {
        title: 'Returns Policy',
        intro: 'We accept returns within 30 days of delivery for most items. To be eligible for a return, your item must be unused and in the same condition that you received it.',
        processTitle: 'Return Process',
        process: [
          'Contact our customer service team to initiate a return',
          'Package the item securely with all original packaging',
          'Include the return authorization number on the package',
          'We send the return address with the authorization'
        ],
        refund: 'Once your return is received and inspected, we will process your refund within 5-7 business days.'
      },
      contact: {
        title: 'Contact Us',
        description: 'If you have any questions about our shipping or returns policy, please contact us:',
        items: [
          'Email: contact@flatearthequipment.com',
          'Address: 30 N Gould St, Ste R, Sheridan, WY 82801'
        ]
      }
    },
    es: {
      title: 'Política de Envío y Devoluciones',
      shipping: {
        title: 'Información de Envío',
        intro: 'Enviamos dentro de Estados Unidos. El flete se calcula al pagar.',
        methodsTitle: 'Envío',
        methods: [
          'El flete se calcula al pagar',
          'El pago solo acepta direcciones de envío en Estados Unidos'
        ],
        costs: 'El flete se calcula al pagar, según la pieza y la dirección de envío.'
      },
      returns: {
        title: 'Política de Devoluciones',
        intro: 'Aceptamos devoluciones dentro de 30 días de entrega para la mayoría de artículos. Para ser elegible para una devolución, su artículo debe estar sin usar y en la misma condición en que lo recibió.',
        processTitle: 'Proceso de Devolución',
        process: [
          'Contacte a nuestro equipo de servicio al cliente para iniciar una devolución',
          'Empaque el artículo de forma segura con todo el empaque original',
          'Incluya el número de autorización de devolución en el paquete',
          'Enviamos la dirección de devolución con la autorización'
        ],
        refund: 'Una vez que su devolución sea recibida e inspeccionada, procesaremos su reembolso dentro de 5-7 días hábiles.'
      },
      contact: {
        title: 'Contáctanos',
        description: 'Si tiene alguna pregunta sobre nuestra política de envío o devoluciones, por favor contáctenos:',
        items: [
          'Correo electrónico: contact@flatearthequipment.com',
          'Dirección: 30 N Gould St, Ste R, Sheridan, WY 82801'
        ]
      }
    }
  }[locale]

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">{t.title}</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t.shipping.title}</h2>
        <div className="prose prose-slate">
          <p>{t.shipping.intro}</p>
          <h3>{t.shipping.methodsTitle}</h3>
          <ul>
            {t.shipping.methods.map((method, index) => (
              <li key={index}>{method}</li>
            ))}
          </ul>
          <p>{t.shipping.costs}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t.returns.title}</h2>
        <div className="prose prose-slate">
          <p>{t.returns.intro}</p>
          <h3>{t.returns.processTitle}</h3>
          <ol>
            {t.returns.process.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <p>{t.returns.refund}</p>
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