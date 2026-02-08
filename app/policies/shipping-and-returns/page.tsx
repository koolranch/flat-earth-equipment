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
        intro: 'We offer shipping to all 50 states and Canada. Most orders are processed and shipped within 1-2 business days.',
        methodsTitle: 'Shipping Methods',
        methods: [
          'Standard Ground Shipping (3-5 business days)',
          'Expedited Shipping (2-3 business days)',
          'Express Shipping (1-2 business days)'
        ],
        costs: 'Shipping costs are calculated based on the weight and dimensions of your order, as well as the destination.'
      },
      returns: {
        title: 'Returns Policy',
        intro: 'We accept returns within 30 days of delivery for most items. To be eligible for a return, your item must be unused and in the same condition that you received it.',
        processTitle: 'Return Process',
        process: [
          'Contact our customer service team to initiate a return',
          'Package the item securely with all original packaging',
          'Include the return authorization number on the package',
          'Ship the item back to our warehouse'
        ],
        refund: 'Once your return is received and inspected, we will process your refund within 5-7 business days.'
      },
      contact: {
        title: 'Contact Us',
        description: 'If you have any questions about our shipping or returns policy, please contact us:',
        items: [
          'Email: support@flatearthequipment.com',
          'Phone: (555) 123-4567',
          'Hours: Monday-Friday, 9am-5pm EST'
        ]
      }
    },
    es: {
      title: 'Política de Envío y Devoluciones',
      shipping: {
        title: 'Información de Envío',
        intro: 'Ofrecemos envío a los 50 estados y Canadá. La mayoría de los pedidos se procesan y envían dentro de 1-2 días hábiles.',
        methodsTitle: 'Métodos de Envío',
        methods: [
          'Envío Terrestre Estándar (3-5 días hábiles)',
          'Envío Acelerado (2-3 días hábiles)',
          'Envío Express (1-2 días hábiles)'
        ],
        costs: 'Los costos de envío se calculan basándose en el peso y dimensiones de su pedido, así como el destino.'
      },
      returns: {
        title: 'Política de Devoluciones',
        intro: 'Aceptamos devoluciones dentro de 30 días de entrega para la mayoría de artículos. Para ser elegible para una devolución, su artículo debe estar sin usar y en la misma condición en que lo recibió.',
        processTitle: 'Proceso de Devolución',
        process: [
          'Contacte a nuestro equipo de servicio al cliente para iniciar una devolución',
          'Empaque el artículo de forma segura con todo el empaque original',
          'Incluya el número de autorización de devolución en el paquete',
          'Envíe el artículo de vuelta a nuestro almacén'
        ],
        refund: 'Una vez que su devolución sea recibida e inspeccionada, procesaremos su reembolso dentro de 5-7 días hábiles.'
      },
      contact: {
        title: 'Contáctanos',
        description: 'Si tiene alguna pregunta sobre nuestra política de envío o devoluciones, por favor contáctenos:',
        items: [
          'Correo electrónico: support@flatearthequipment.com',
          'Teléfono: (555) 123-4567',
          'Horario: Lunes-Viernes, 9am-5pm EST'
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