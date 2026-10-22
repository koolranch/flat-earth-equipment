import { Truck, Shield, Wrench, Phone, ShipIcon } from "lucide-react";
type Locale = 'en' | 'es';

export default function ChargerModuleTrustBadges({ locale = 'en' }: { locale?: Locale }) {

  const t = {
    en: {
      badges: [
        {
          title: "Ships in the US",
          description: "Freight is calculated at checkout"
        },
        {
          title: "Free Shipping",
          description: "No freight charges nationwide"
        },
        {
          title: "6-Month Warranty", 
          description: "Coverage on remanufactured modules and repairs"
        },
        {
          title: "Expert Rebuilt",
          description: "Bench-tested before it ships"
        },
        {
          title: "U.S.-Based Support",
          description: "Technical assistance available"
        }
      ]
    },
    es: {
      badges: [
        {
          title: "Envío en EE.UU.",
          description: "El flete se calcula al pagar"
        },
        {
          title: "Envío Gratuito",
          description: "Sin cargos de flete a nivel nacional"
        },
        {
          title: "Garantía de 6 Meses",
          description: "Cobertura en módulos remanufacturados y reparaciones"
        },
        {
          title: "Reconstruido por Expertos", 
          description: "Probado en banco antes de enviarse"
        },
        {
          title: "Soporte con Base en EE.UU.",
          description: "Asistencia técnica disponible"
        }
      ]
    }
  }[locale];

  const icons = [Truck, ShipIcon, Shield, Wrench, Phone];

  return (
    <section className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
        {t.badges.map((badge, index) => {
          const Icon = icons[index];
          return (
            <div key={index} className="space-y-2">
              <Icon className="h-8 w-8 text-canyon-rust mx-auto" />
              <h3 className="font-semibold text-sm text-gray-900">{badge.title}</h3>
              <p className="text-xs text-gray-600">
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
} 