'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Zap, Shield, Truck, Recycle, Smartphone, Clock, Gauge, MapPin, Leaf, Battery } from 'lucide-react';
import Script from 'next/script';
import { supabaseBrowser } from '@/lib/supabase/client';
import AddToCartButton from '@/components/AddToCartButton';
import { useState, useEffect } from 'react';

// Translation strings
const translations = {
  en: {
    metadata: {
      title: "Electric Vehicle Chargers | Level 2 EV Charging Stations | Flat Earth Equipment",
      description: "Professional-grade electric vehicle chargers and EV charging stations. Remanufactured Level 2 chargers with smart features, weather-resistant design, and eco-friendly sustainability.",
      keywords: "electric vehicle chargers, ev chargers, level 2 charging station, ev charging equipment, remanufactured ev chargers, chargepoint, electric car chargers",
    },
    header: {
      badge: "Eco-Friendly Remanufactured Solutions",
      title: "Professional Electric Vehicle Chargers",
      subtitle: "Smart Level 2 EV charging stations for faster, more efficient charging at home, work, and commercial locations. Professionally remanufactured for reliability and sustainability."
    },
    features: {
      title: "Advanced EV Charging Technology",
      items: [
        {
          title: "Fast Level 2 Charging",
          description: "Dramatically reduce charging time with 6x faster speeds than standard 120V outlets"
        },
        {
          title: "Smart Connectivity", 
          description: "Monitor, schedule, and track charging sessions remotely with mobile app integration"
        },
        {
          title: "Universal Compatibility",
          description: "J1772 connectors work with all electric vehicles, including Tesla with adapter"
        },
        {
          title: "Versatile Installation",
          description: "Indoor and outdoor rated for home garages, workplaces, and commercial properties"
        }
      ]
    },
    inventory: {
      title: "In-Stock EV Charging Solutions",
      subtitle: "Professional-grade electric vehicle chargers ready to ship today. All units are expertly remanufactured and backed by our quality guarantee.",
      sameDayShip: "Same-Day Ship",
      qualityGuaranteed: "Quality Guaranteed",
      coreDeposit: "refundable core deposit",
      buyNow: "Buy Now & Ship Today →",
      noChargers: {
        title: "More EV Chargers Coming Soon",
        description: "We're expanding our electric vehicle charger inventory. Contact us for specific EV charging requirements.",
        contact: "Contact for EV Charging Solutions"
      }
    },
    whyEV: {
      title: "Why Install Electric Vehicle Charging?",
      benefits: [
        "Reduce dependency on public charging networks",
        "Convenient overnight charging at home or work", 
        "Significant cost savings compared to public charging",
        "Increase property value with EV charging infrastructure",
        "Support the growing electric vehicle ecosystem"
      ],
      fastCharging: {
        title: "Fast Charging Benefits",
        items: [
          "Level 2 charging: 6x faster than standard outlets",
          "Add 25-30 miles of range per hour of charging",
          "Full overnight charging for daily commuting",
          "Smart scheduling for off-peak electricity rates",
          "Weather-resistant for year-round reliability"
        ]
      }
    },
    environmental: {
      title: "Sustainable EV Charging Solutions",
      subtitle: "Our remanufactured EV chargers combine environmental responsibility with professional-grade performance.",
      benefits: [
        {
          title: "Sustainable Choice",
          description: "Remanufactured chargers reduce electronic waste while delivering like-new performance"
        },
        {
          title: "Lower Carbon Footprint", 
          description: "Support environmental responsibility with refurbished equipment that avoids new manufacturing"
        },
        {
          title: "Quality Assured",
          description: "Professional remanufacturing process ensures reliability that exceeds original specifications"
        }
      ]
    },
    coreReturn: {
      title: "Simple Core Return Process",
      subtitle: "Many of our EV chargers include a refundable core deposit. Here's how our hassle-free return process works:",
      steps: [
        {
          title: "Order & Receive",
          description: "We temporarily charge the refundable core deposit. Your remanufactured EV charger ships immediately."
        },
        {
          title: "Return Your Old Unit",
          description: "Use our prepaid shipping label to send your old charger within 30 days."
        },
        {
          title: "Get Your Refund", 
          description: "Full core deposit refund issued within 48 hours of receiving your old unit."
        }
      ]
    },
    trustBadges: [
      { title: "Same-Day Dispatch", desc: "Ships today if ordered before 3 PM EST" },
      { title: "Quality Guaranteed", desc: "Professionally remanufactured to exceed OEM specs" },
      { title: "Fast Installation", desc: "Professional hardwired setup available" },
      { title: "Eco-Friendly", desc: "Sustainable choice supporting environmental responsibility" }
    ],
    crossPromo: {
      badge: "Also Available",
      title: "Need Forklift Charger Modules?",
      description: "We also specialize in forklift charger modules with instant exchange and repair options. Same quality remanufacturing process and environmental benefits for your industrial fleet.",
      link: "Shop Forklift Charger Modules →"
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "What is Level 2 charging?",
          answer: "Level 2 chargers operate at 240V and provide 6x faster charging than standard 120V household outlets, typically adding 25-30 miles of range per hour."
        },
        {
          question: "Do they work with all electric vehicles?",
          answer: "Yes, our chargers use the J1772 standard which is compatible with all EVs in North America. Teslas can use a simple adapter."
        },
        {
          question: "Can they be installed outdoors?",
          answer: "Absolutely. Our chargers are rated for both indoor and outdoor installation with weather protection for reliable year-round operation."
        },
        {
          question: "What does 'remanufactured' mean?",
          answer: "Our chargers go through a professional remanufacturing process where they are completely inspected, repaired, and tested to exceed original manufacturer specifications."
        },
        {
          question: "Do they include smart features?",
          answer: "Many of our chargers include WiFi connectivity, mobile app monitoring, charge scheduling, and energy management capabilities."
        },
        {
          question: "What warranty do they include?",
          answer: "All our remanufactured chargers come with a comprehensive quality warranty and technical support to ensure reliable operation."
        }
      ]
    },
    finalCTA: {
      title: "Ready to Upgrade to Electric Vehicle Charging?",
      subtitle: "Join the electric vehicle revolution with professional-grade charging solutions. Fast, smart, and environmentally responsible.",
      browseAll: "Browse All EV Chargers →",
      getCustom: "Get Custom EV Solution"
    }
  },
  es: {
    metadata: {
      title: "Cargadores de Vehículos Eléctricos | Estaciones de Carga EV Nivel 2 | Flat Earth Equipment",
      description: "Cargadores de vehículos eléctricos de grado profesional y estaciones de carga EV. Cargadores Nivel 2 remanufacturados con características inteligentes, diseño resistente al clima y sostenibilidad ecológica.",
      keywords: "cargadores vehículos eléctricos, cargadores ev, estación carga nivel 2, equipo carga ev, cargadores ev remanufacturados, chargepoint, cargadores autos eléctricos",
    },
    header: {
      badge: "Soluciones Remanufacturadas Ecológicas",
      title: "Cargadores Profesionales de Vehículos Eléctricos", 
      subtitle: "Estaciones de carga EV Nivel 2 inteligentes para carga más rápida y eficiente en casa, trabajo y ubicaciones comerciales. Profesionalmente remanufacturados para confiabilidad y sostenibilidad."
    },
    features: {
      title: "Tecnología Avanzada de Carga EV",
      items: [
        {
          title: "Carga Rápida Nivel 2",
          description: "Reduce dramáticamente el tiempo de carga con velocidades 6x más rápidas que tomacorrientes estándar de 120V"
        },
        {
          title: "Conectividad Inteligente",
          description: "Monitorea, programa y rastrea sesiones de carga remotamente con integración de aplicaciones móviles"
        },
        {
          title: "Compatibilidad Universal", 
          description: "Conectores J1772 funcionan con todos los vehículos eléctricos, incluyendo Tesla con adaptador"
        },
        {
          title: "Instalación Versátil",
          description: "Clasificado para interior y exterior, ideal para garajes residenciales, lugares de trabajo y propiedades comerciales"
        }
      ]
    },
    inventory: {
      title: "Soluciones de Carga EV en Inventario",
      subtitle: "Cargadores de vehículos eléctricos de grado profesional listos para envío hoy. Todas las unidades están expertamente remanufacturadas y respaldadas por nuestra garantía de calidad.",
      sameDayShip: "Envío Mismo Día",
      qualityGuaranteed: "Calidad Garantizada",
      coreDeposit: "depósito de núcleo reembolsable",
      buyNow: "Comprar Ahora & Envío Hoy →",
      noChargers: {
        title: "Más Cargadores EV Próximamente",
        description: "Estamos expandiendo nuestro inventario de cargadores de vehículos eléctricos. Contáctanos para requisitos específicos de carga EV.",
        contact: "Contactar para Soluciones de Carga EV"
      }
    },
    whyEV: {
      title: "¿Por Qué Instalar Carga de Vehículos Eléctricos?",
      benefits: [
        "Reduce la dependencia en redes de carga pública",
        "Carga conveniente durante la noche en casa o trabajo",
        "Ahorros significativos comparado con carga pública", 
        "Aumenta el valor de la propiedad con infraestructura de carga EV",
        "Apoya el creciente ecosistema de vehículos eléctricos"
      ],
      fastCharging: {
        title: "Beneficios de Carga Rápida",
        items: [
          "Carga Nivel 2: 6x más rápida que tomacorrientes estándar",
          "Agrega 25-30 millas de autonomía por hora de carga",
          "Carga completa nocturna para desplazamientos diarios",
          "Programación inteligente para tarifas eléctricas fuera de pico",
          "Resistente al clima para confiabilidad durante todo el año"
        ]
      }
    },
    environmental: {
      title: "Soluciones de Carga EV Sostenibles",
      subtitle: "Nuestros cargadores EV remanufacturados combinan responsabilidad ambiental con rendimiento de grado profesional.",
      benefits: [
        {
          title: "Opción Sostenible",
          description: "Los cargadores remanufacturados reducen residuos electrónicos mientras entregan rendimiento como nuevo"
        },
        {
          title: "Menor Huella de Carbono",
          description: "Apoya la responsabilidad ambiental con equipo reacondicionado que evita nueva manufactura"
        },
        {
          title: "Calidad Asegurada",
          description: "El proceso profesional de remanufactura asegura confiabilidad que supera las especificaciones originales"
        }
      ]
    },
    coreReturn: {
      title: "Proceso Simple de Devolución de Núcleo",
      subtitle: "Muchos de nuestros cargadores EV incluyen un depósito de núcleo reembolsable. Así funciona nuestro proceso de devolución sin complicaciones:",
      steps: [
        {
          title: "Ordenar y Recibir",
          description: "Cobramos temporalmente el depósito de núcleo reembolsable. Tu cargador EV remanufacturado se envía inmediatamente."
        },
        {
          title: "Devolver Tu Unidad Vieja",
          description: "Usa nuestra etiqueta de envío prepagada para enviar tu cargador viejo dentro de 30 días."
        },
        {
          title: "Obtén Tu Reembolso",
          description: "Reembolso completo del depósito de núcleo emitido dentro de 48 horas de recibir tu unidad vieja."
        }
      ]
    },
    trustBadges: [
      { title: "Despacho Mismo Día", desc: "Se envía hoy si se ordena antes de 3 PM EST" },
      { title: "Calidad Garantizada", desc: "Profesionalmente remanufacturado para superar especificaciones OEM" },
      { title: "Instalación Rápida", desc: "Configuración cableada profesional disponible" },
      { title: "Ecológico", desc: "Opción sostenible que apoya la responsabilidad ambiental" }
    ],
    crossPromo: {
      badge: "También Disponible",
      title: "¿Necesitas Módulos de Cargador de Montacargas?",
      description: "También nos especializamos en módulos de cargador de montacargas con opciones de intercambio instantáneo y reparación. El mismo proceso de remanufactura de calidad y beneficios ambientales para tu flota industrial.",
      link: "Comprar Módulos de Cargador de Montacargas →"
    },
    faq: {
      title: "Preguntas Frecuentes",
      items: [
        {
          question: "¿Qué es un cargador Nivel 2?",
          answer: "Los cargadores Nivel 2 operan a 240V y proporcionan carga 6x más rápida que tomacorrientes domésticos estándar de 120V, agregando típicamente 25-30 millas de autonomía por hora."
        },
        {
          question: "¿Funcionan con todos los vehículos eléctricos?",
          answer: "Sí, nuestros cargadores usan el estándar J1772 que es compatible con todos los EVs en Norteamérica. Los Teslas pueden usar un adaptador simple."
        },
        {
          question: "¿Se pueden instalar en exteriores?",
          answer: "Absolutamente. Nuestros cargadores están clasificados para instalación interior y exterior con protección contra clima para operación confiable durante todo el año."
        },
        {
          question: "¿Qué significa 'remanufacturado'?",
          answer: "Nuestros cargadores pasan por un proceso profesional de remanufactura donde son completamente inspeccionados, reparados y probados para superar las especificaciones originales del fabricante."
        },
        {
          question: "¿Incluyen características inteligentes?",
          answer: "Muchos de nuestros cargadores incluyen conectividad WiFi, monitoreo de aplicaciones móviles, programación de carga y capacidades de gestión de energía."
        },
        {
          question: "¿Qué garantía incluyen?",
          answer: "Todos nuestros cargadores remanufacturados vienen con garantía de calidad completa y soporte técnico para asegurar operación confiable."
        }
      ]
    },
    finalCTA: {
      title: "¿Listo para Actualizar a Carga de Vehículos Eléctricos?",
      subtitle: "Únete a la revolución de vehículos eléctricos con soluciones de carga de grado profesional. Rápido, inteligente y ambientalmente responsable.",
      browseAll: "Ver Todos los Cargadores EV →", 
      getCustom: "Obtener Solución EV Personalizada"
    }
  }
};

// Metadata moved to layout.tsx since this is a client component

export default function ElectricVehicleChargersPage() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [evChargers, setEvChargers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current translations
  const t = translations[language];

  useEffect(() => {
    // Detect language from browser
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) {
      setLanguage('es');
    }
    
    // Fetch EV chargers
    async function fetchChargers() {
      try {
        const supabase = supabaseBrowser;
        const { data, error } = await supabase
          .from('parts')
          .select('*')
          .eq('category', 'battery chargers')
          .ilike('name', '%ev%')
          .or('name.ilike.%chargepoint%,name.ilike.%electric vehicle%,name.ilike.%level 2%')
          .order('name');

        // If no EV-specific chargers found, get all battery chargers that could work for EVs
        if (!data || data.length === 0) {
          const { data: allChargers, error: fallbackError } = await supabase
            .from('parts')
            .select('*')
            .eq('category', 'battery chargers')
            .order('name');
          setEvChargers(allChargers || []);
        } else {
          setEvChargers(data || []);
        }
      } catch (error) {
        console.error('Error fetching chargers:', error);
        setEvChargers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchChargers();
  }, []);

  const featureIcons = [Zap, Smartphone, Shield, MapPin];
  const environmentalIcons = [Recycle, Leaf, Shield];
  const trustBadgeIcons = [Truck, Shield, Clock, Recycle];

  return (
    <>
      <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16 pb-20 sm:pb-12">
        {/* JSON-LD Structured Data for SEO */}
        <Script id="ev-chargers-ld-json" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": language === 'es' ? "Cargadores de Vehículos Eléctricos" : "Electric Vehicle Chargers",
            "description": language === 'es' ? 
              "Cargadores de vehículos eléctricos de grado profesional y estaciones de carga EV. Cargadores Nivel 2 remanufacturados con características inteligentes." :
              "Professional-grade electric vehicle chargers and EV charging stations. Remanufactured Level 2 chargers with smart features.",
            "url": "https://www.flatearthequipment.com/electric-vehicle-chargers",
            "inLanguage": language,
            "numberOfItems": evChargers.length,
            "itemListElement": evChargers.map((charger, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "sku": charger.sku,
                "name": charger.name,
                "brand": {
                  "@type": "Brand",
                  "name": charger.brand
                },
                "image": charger.image_url,
                "description": charger.description,
                "offers": {
                  "@type": "Offer",
                  "price": charger.price.toString(),
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock",
                  "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                },
                "additionalProperty": charger.has_core_charge ? [
                  {
                    "@type": "PropertyValue",
                    "name": language === 'es' ? "Depósito de Núcleo" : "Core Charge",
                    "value": `$${charger.core_charge} (${language === 'es' ? 'reembolsable' : 'refundable'})`
                  }
                ] : []
              }
            }))
          })}
        </Script>

        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === 'en' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === 'es' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Español
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <Recycle className="h-4 w-4" />
            {t.header.badge}
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold">
            {t.header.title}
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            {t.header.subtitle}
          </p>
        </header>

        {/* Key Features */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-center">
            {t.features.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.items.map((feature, index) => (
              <div key={index} className="text-center space-y-4 p-6 bg-white rounded-xl shadow-sm border">
                <div className="mx-auto w-12 h-12 bg-canyon-rust/10 rounded-lg flex items-center justify-center">
                  {React.createElement(featureIcons[index], { className: "h-6 w-6 text-canyon-rust" })}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Available EV Chargers */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">
              {t.inventory.title}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t.inventory.subtitle}
            </p>
          </div>

          {evChargers.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {evChargers.map((charger) => (
                <article
                  key={charger.id}
                  className="border rounded-xl shadow-sm p-6 flex flex-col bg-white hover:shadow-md transition-shadow"
                >
                  <Link href={`/parts/${charger.slug}`} className="mb-4">
                    <div className="relative aspect-square w-full">
                      <Image
                        src={charger.image_url || '/images/placeholder-charger.jpg'}
                        alt={charger.name}
                        fill
                        className="object-contain rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 space-y-3">
                    <div className="text-center">
                      <span className="text-sm text-gray-500 font-medium">{charger.brand}</span>
                      <h3 className="font-bold text-lg leading-tight mt-1">
                        <Link href={`/parts/${charger.slug}`} className="hover:text-canyon-rust transition-colors">
                          {charger.name}
                        </Link>
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {charger.description?.slice(0, 120)}...
                    </p>

                    <div className="flex justify-center gap-2 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {t.inventory.sameDayShip}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {t.inventory.qualityGuaranteed}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="text-center">
                      <div className="font-bold text-2xl text-canyon-rust">
                        ${charger.price.toFixed(0)}
                      </div>
                      {charger.has_core_charge && charger.core_charge && (
                        <div className="text-sm text-gray-600">
                          + ${charger.core_charge.toFixed(0)} {t.inventory.coreDeposit}
                        </div>
                      )}
                    </div>
                    
                    <AddToCartButton
                      sku={charger.sku}
                      qty={1}
                      price={charger.price * 100}
                      meta={{ productId: charger.id }}
                      className="w-full bg-canyon-rust text-white py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
                    >
                      {t.inventory.buyNow}
                    </AddToCartButton>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t.inventory.noChargers.title}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {t.inventory.noChargers.description}
              </p>
              <Link 
                href="/contact" 
                className="inline-block mt-4 bg-canyon-rust text-white px-6 py-2 rounded-lg hover:bg-canyon-rust/90 transition-colors"
              >
                {t.inventory.noChargers.contact}
              </Link>
            </div>
          )}
        </section>

        {/* Why Choose EV Charging */}
        <section className="bg-blue-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-blue-900">
            {t.whyEV.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {t.whyEV.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-800">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">{t.whyEV.fastCharging.title}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {t.whyEV.fastCharging.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Environmental Benefits */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">
              {t.environmental.title}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t.environmental.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.environmental.benefits.map((benefit, index) => (
              <div key={index} className="text-center space-y-4 p-6 bg-green-50 rounded-xl">
                <div className="mx-auto w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                  {React.createElement(environmentalIcons[index], { className: "h-6 w-6 text-green-600" })}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-green-800 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Return Process */}
        <section className="bg-gray-50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">
            {t.coreReturn.title}
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            {t.coreReturn.subtitle}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {t.coreReturn.steps.map((step, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="bg-canyon-rust text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold">
                  {index + 1}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {t.trustBadges.map((badge, index) => (
            <div key={index} className="text-center space-y-3 p-4 bg-white rounded-lg shadow-sm">
              {React.createElement(trustBadgeIcons[index], { className: "h-8 w-8 text-canyon-rust mx-auto" })}
              <div>
                <h3 className="font-semibold text-sm">{badge.title}</h3>
                <p className="text-xs text-gray-600">{badge.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Cross-promotion to Forklift Charger Modules */}
        <section className="bg-orange-50 rounded-2xl p-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-orange-600/10 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
            <Battery className="h-4 w-4" />
            {t.crossPromo.badge}
          </div>
          <h2 className="text-2xl font-bold text-orange-900">
            {t.crossPromo.title}
          </h2>
          <p className="text-orange-800 max-w-2xl mx-auto">
            {t.crossPromo.description}
          </p>
          <Link
            href="/charger-modules"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            <Battery className="h-5 w-5" />
            {t.crossPromo.link}
          </Link>
        </section>

        {/* FAQ Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-center">
            {t.faq.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.faq.items.map((item, index) => (
              <details key={index} className="bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer">{item.question}</summary>
                <p className="mt-2 text-gray-700">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-6 bg-canyon-rust/5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold">
            {t.finalCTA.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.finalCTA.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/parts?category=battery+chargers"
              className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
            >
              {t.finalCTA.browseAll}
            </Link>
            <Link
              href="/contact"
              className="border border-canyon-rust text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/10 transition-colors"
            >
              {t.finalCTA.getCustom}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
} 