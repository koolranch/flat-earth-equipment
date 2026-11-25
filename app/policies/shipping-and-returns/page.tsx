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
        intro: 'You can return an unused, uninstalled part within 90 days of delivery. Email parts@flatearthequipment.com with your order number before you ship anything. We reply with return instructions for every return, including where to send the part. Do not ship a return to our Sheridan, Wyoming office.',
        processTitle: 'Restocking and warranty',
        process: [
          'A return that is not a defective part and not a warranty claim has a 25% restocking fee. You pay the return freight unless the instructions say we cover it.',
          'Defective parts, parts we sent by mistake, and warranty claims do not have a restocking fee. The instructions say where to send the part and whether we cover the return freight.',
          'A core deposit is separate from the part price and from the restocking fee. Follow the return instructions for the core.',
          'Eligible aftermarket parts carry a 2-year warranty. Battery chargers, controllers, charger modules, and parts with a core charge follow the coverage on the product page.'
        ],
        refund: 'After the return arrives and we inspect it, we refund the eligible amount to the original payment method within 5 business days.'
      },
      contact: {
        title: 'Contact Us',
        description: 'Questions about shipping or a return:',
        items: [
          'Email: parts@flatearthequipment.com'
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
        intro: 'Puede devolver una pieza sin usar y sin instalar dentro de 90 días de la entrega. Escriba a parts@flatearthequipment.com con su número de pedido antes de enviar algo. Respondemos con instrucciones de devolución en cada caso, incluida la dirección. No envíe una devolución a nuestra oficina de Sheridan, Wyoming.',
        processTitle: 'Reposición y garantía',
        process: [
          'Una devolución que no es una pieza defectuosa ni un reclamo de garantía tiene un cargo de reposición del 25%. Usted paga el flete de devolución, salvo que las instrucciones digan que lo cubrimos.',
          'Las piezas defectuosas, las piezas enviadas por error y los reclamos de garantía no tienen cargo de reposición. Las instrucciones indican adónde enviar la pieza y si cubrimos el flete de devolución.',
          'El depósito de núcleo es aparte del precio de la pieza y del cargo de reposición. Siga las instrucciones de devolución para el núcleo.',
          'Las piezas de posventa elegibles tienen garantía de 2 años. Cargadores, controladores, módulos de cargador y piezas con depósito de núcleo siguen la cobertura de la página del producto.'
        ],
        refund: 'Cuando la devolución llega y la revisamos, reembolsamos el monto correspondiente al método de pago original dentro de 5 días hábiles.'
      },
      contact: {
        title: 'Contáctanos',
        description: 'Preguntas sobre envío o una devolución:',
        items: [
          'Correo electrónico: parts@flatearthequipment.com'
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