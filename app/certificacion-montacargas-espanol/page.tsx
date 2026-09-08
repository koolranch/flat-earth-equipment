import Link from "next/link"
import Script from "next/script"
import { getUserLocale } from "@/lib/getUserLocale"

export const metadata = {
  title: "Certificación de Montacargas en Línea – OSHA en Español (30 min)",
  description:
    "Completa tu curso de montacargas en menos de 1 hora. Obtén tu certificado PDF inmediato. Español e inglés incluidos – solo $59.",
  alternates: {
    canonical: "https://www.flatearthequipment.com/certificacion-montacargas-espanol",
    languages: { 
      "en-US": "https://www.flatearthequipment.com/safety",
      "es": "https://www.flatearthequipment.com/certificacion-montacargas-espanol" 
    },
  },
  openGraph: {
    title: "Curso OSHA de Montacargas (Español)",
    description:
      "Certifícate 100% online en menos de 30 min, PDF instantáneo.",
    url: "https://www.flatearthequipment.com/certificacion-montacargas-espanol",
    type: "website",
  },
}

export default function CertificacionMontacargasEspanol() {
  return (
    <>
      <Script id="spanish-forklift-course-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Certificación de Montacargas en Línea OSHA",
          "description": "Curso completo de seguridad para operadores de montacargas en español, conforme a OSHA 29 CFR 1910.178(l)",
          "provider": {
            "@type": "Organization",
            "name": "Flat Earth Equipment",
            "url": "https://www.flatearthequipment.com"
          },
          "courseMode": "online",
          "educationalLevel": "beginner",
          "timeRequired": "PT1H",
          "inLanguage": ["es", "en"],
          "offers": {
            "@type": "Offer",
            "price": "59",
            "priceCurrency": "USD"
          },
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "instructor": {
              "@type": "Organization",
              "name": "Flat Earth Equipment"
            }
          }
        })}
      </Script>

      <Script id="spanish-forklift-faq-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "¿Este curso está aprobado por OSHA?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sí, cumple completamente con la norma OSHA 29 CFR 1910.178(l) para entrenamiento de operadores de montacargas."
              }
            },
            {
              "@type": "Question",
              "name": "¿Puedo hacerlo desde el móvil?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Claro, el curso es 100% responsivo y funciona perfectamente en cualquier dispositivo móvil, tablet o computadora."
              }
            },
            {
              "@type": "Question",
              "name": "¿Cuánto tiempo tengo acceso?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Acceso ilimitado por 12 meses para repasar módulos y descargar de nuevo tu certificado cuando sea necesario."
              }
            }
          ]
        })}
      </Script>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-slate prose-lg mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
            Certificación de Montacargas en Línea (Curso en Español)
          </h1>

          <p className="text-xl text-center mb-8 text-gray-700 font-medium">
            Completa el entrenamiento teórico exigido por OSHA en <strong>&lt; 30 minutos</strong>.
            PDF de certificado inmediato, exámenes ilimitados y versión en inglés sin costo extra.
          </p>

          <div className="text-center mb-10">
            <Link
              href="/safety"
              className="inline-block rounded-xl bg-orange-600 px-8 py-4 text-xl font-semibold text-white no-underline transition hover:bg-orange-700 shadow-lg"
            >
              Empieza Ahora – $59
            </Link>
            <p className="text-sm text-gray-600 mt-2">
              ✓ Acceso inmediato ✓ Garantía de devolución ✓ Soporte 24/7
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🎯 Perfecto para trabajadores hispanos en EE.UU.
            </h3>
            <p className="text-blue-800 mb-0">
              Nuestro curso bilingüe te permite aprender en español y obtener certificación válida
              en todos los estados. Ideal para almacenes, construcción, manufactura y logística.
            </p>
          </div>

          <h2>¿Por qué elegir este curso?</h2>
          <ul className="space-y-2">
            <li><strong>100% en línea, a tu ritmo</strong> – pausa y continúa cuando quieras.</li>
            <li><strong>Videos cortos y mini-juegos interactivos</strong> – nada de diapositivas aburridas.</li>
            <li><strong>Cumple con la norma OSHA 29 CFR 1910.178(l)</strong> – aceptado por empleadores.</li>
            <li><strong>Exámenes ilimitados</strong> hasta aprobar con 80%.</li>
            <li><strong>Certificado instantáneo</strong> – descarga tu PDF al terminar.</li>
            <li><strong>Soporte en español</strong> por chat y correo electrónico.</li>
          </ul>

          <h2>¿Qué incluye tu curso?</h2>
          <ol className="space-y-2">
            <li><strong>Acceso inmediato</strong> al contenido en español e inglés.</li>
            <li><strong>5 módulos interactivos</strong> con videos y demostraciones.</li>
            <li><strong>6 mini-juegos</strong> para practicar habilidades reales.</li>
            <li><strong>PDF de certificado y tarjeta de bolsillo</strong> al finalizar.</li>
            <li><strong>Lista de verificación</strong> para evaluación práctica del empleador.</li>
            <li><strong>Soporte técnico</strong> por chat y correo 7 días a la semana.</li>
          </ol>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              📋 Módulos del curso (en español):
            </h3>
            <ul className="text-green-800 space-y-1">
              <li>• Introducción: Regulaciones OSHA y estadísticas</li>
              <li>• Módulo 1: Inspección pre-operacional</li>
              <li>• Módulo 2: Procedimientos de operación</li>
              <li>• Módulo 3: Manejo de cargas y estabilidad</li>
              <li>• Módulo 4: Seguridad en el lugar de trabajo</li>
              <li>• Módulo 5: Procedimientos de emergencia</li>
            </ul>
          </div>

          <h2>Pasos para certificarte hoy</h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <ol className="space-y-3">
              <li><strong>1. Inscríbete:</strong> Haz clic en <em>"Empieza Ahora"</em> y completa el pago seguro.</li>
              <li><strong>2. Estudia:</strong> Sigue los módulos interactivos (menos de 30 minutos).</li>
              <li><strong>3. Examínate:</strong> Toma el examen final (necesitas 80% para aprobar).</li>
              <li><strong>4. Descarga:</strong> Obtén tu certificado PDF inmediatamente.</li>
              <li><strong>5. Evaluación práctica:</strong> Pide a tu empleador la evaluación incluida.</li>
            </ol>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className="space-y-4">
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">¿Este curso está aprobado por OSHA?</summary>
              <p className="mt-2 text-gray-700">
                Sí, cumple completamente con la norma OSHA 29 CFR 1910.178(l) para entrenamiento de operadores de montacargas.
                Es aceptado por empleadores en todos los estados de EE.UU.
              </p>
            </details>
            
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">¿Puedo hacerlo desde el móvil?</summary>
              <p className="mt-2 text-gray-700">
                Claro, el curso es 100% responsivo y funciona perfectamente en cualquier dispositivo móvil, tablet o computadora.
                Puedes pausar y continuar desde donde lo dejaste.
              </p>
            </details>
            
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">¿Cuánto tiempo tengo acceso?</summary>
              <p className="mt-2 text-gray-700">
                Acceso ilimitado por 12 meses para repasar módulos y descargar de nuevo tu certificado cuando sea necesario.
                También puedes retomar el examen las veces que necesites.
              </p>
            </details>
            
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">¿Qué pasa si no apruebo el examen?</summary>
              <p className="mt-2 text-gray-700">
                No te preocupes. Puedes retomar el examen tantas veces como necesites sin costo adicional.
                Nuestro equipo de soporte también está disponible para ayudarte.
              </p>
            </details>
            
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">¿Necesito experiencia previa?</summary>
              <p className="mt-2 text-gray-700">
                No se requiere experiencia previa. El curso está diseñado para principiantes y cubre todo lo necesario
                para operar montacargas de forma segura según las regulaciones OSHA.
              </p>
            </details>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-400 p-6 mb-8">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              ⚠️ Importante: Evaluación práctica requerida
            </h3>
            <p className="text-orange-800 mb-0">
              Después de completar nuestro curso teórico, OSHA requiere que tu empleador realice una evaluación práctica
              de tus habilidades. Incluimos el formulario oficial y las instrucciones para tu supervisor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">👷 Industrias que requieren certificación:</h3>
              <ul className="text-blue-800 space-y-1">
                <li>• Almacenes y distribución</li>
                <li>• Construcción</li>
                <li>• Manufactura</li>
                <li>• Puertos y logística</li>
                <li>• Supermercados</li>
                <li>• Servicios municipales</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">💰 Beneficios de certificarte:</h3>
              <ul className="text-green-800 space-y-1">
                <li>• Mejores oportunidades de empleo</li>
                <li>• Salarios más altos</li>
                <li>• Cumplimiento legal</li>
                <li>• Trabajo más seguro</li>
                <li>• Confianza del empleador</li>
                <li>• Certificado válido 3 años</li>
              </ul>
            </div>
          </div>

          <div className="text-center bg-gray-900 text-white p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-bold mb-4">¿Listo para certificarte?</h3>
            <p className="text-lg mb-6">
              Únete a miles de operadores que ya se han certificado con nosotros
            </p>
            <Link
              href="/safety"
              className="inline-block rounded-xl bg-orange-600 px-8 py-4 text-xl font-semibold text-white no-underline transition hover:bg-orange-700"
            >
              Comenzar Ahora – $59
            </Link>
          </div>

          <h2>Enlaces útiles</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="space-y-2">
              <Link href="/safety" className="block text-blue-600 hover:text-blue-800 underline">
                → Ver curso principal (inglés/español)
              </Link>
              <Link href="/safety/forklift/texas" className="block text-blue-600 hover:text-blue-800 underline">
                → Certificación específica para Texas
              </Link>
              <Link href="/safety/forklift/ca" className="block text-blue-600 hover:text-blue-800 underline">
                → Certificación específica para California
              </Link>
            </div>
            <div className="space-y-2">
              <Link href="/es/safety" className="block text-blue-600 hover:text-blue-800 underline">
                → Guía completa: Licencia de Forklift
              </Link>
              <Link href="/training" className="block text-blue-600 hover:text-blue-800 underline">
                → Otros cursos de capacitación
              </Link>
              <Link href="/about" className="block text-blue-600 hover:text-blue-800 underline">
                → Sobre Flat Earth Equipment
              </Link>
            </div>
          </div>

          <hr className="my-8" />

          <div className="text-center text-sm text-gray-600">
            <p>
              ¿Dudas sobre el curso? <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">Contáctanos</Link> o
              usa nuestro chat en vivo para obtener ayuda inmediata.
            </p>
            <p className="mt-2">
              📧 Email:
              📧 Email: <a href="mailto:support@flatearthequipment.com" className="text-blue-600 hover:text-blue-800">support@flatearthequipment.com</a>
            </p>
          </div>
        </div>
      </main>
    </>
  )
} 