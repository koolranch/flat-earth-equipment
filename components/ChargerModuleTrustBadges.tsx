import { Truck, Shield, Wrench, Phone } from "lucide-react";
import { getUserLocale } from "@/lib/getUserLocale";

export default function ChargerModuleTrustBadges() {
  const locale = getUserLocale();

  const t = {
    en: {
      badges: [
        {
          title: "Same-Day Dispatch",
          description: "Ships today if ordered before 3 PM EST"
        },
        {
          title: "6-Month Warranty", 
          description: "Western-tough reliability guarantee"
        },
        {
          title: "Expert Rebuilt",
          description: "Bench-tested to exceed OEM specs"
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
          title: "Envío el Mismo Día",
          description: "Se envía hoy si se ordena antes de las 3 PM EST"
        },
        {
          title: "Garantía de 6 Meses",
          description: "Garantía de confiabilidad resistente del oeste"
        },
        {
          title: "Reconstruido por Expertos", 
          description: "Probado en banco para superar especificaciones OEM"
        },
        {
          title: "Soporte con Base en EE.UU.",
          description: "Asistencia técnica disponible"
        }
      ]
    }
  }[locale];

  const icons = [Truck, Shield, Wrench, Phone];

  return (
    <section className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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