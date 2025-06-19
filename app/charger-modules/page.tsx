import { CHARGER_MODULES } from "../../constants/chargerOptions";
import OptionSelectorCard from "@/components/OptionSelectorCard";
import ChargerModuleTrustBadges from "@/components/ChargerModuleTrustBadges";
import { getUserLocale } from "@/lib/getUserLocale";

export const metadata = {
  title: "Forklift Charger Modules | Enersys & Hawker | Exchange & Repair | Flat Earth Equipment",
  description: "In-stock remanufactured forklift charger modules for Enersys & Hawker. Choose instant exchange or send-in repair service. 6-month warranty, same-day shipping.",
  keywords: "forklift charger modules, enersys charger module, hawker charger module, forklift charger repair, charger module exchange",
};

export default function ChargersLanding() {
  const locale = getUserLocale();

  const t = {
    en: {
      title: "In-Stock Reman & Repair Charger Modules",
      subtitle: "Choose instant exchange or send-in repair—both backed by our 6-month warranty."
    },
    es: {
      title: "Módulos de Cargador Remanufacturados y Reparación en Stock",
      subtitle: "Elija intercambio instantáneo o reparación por envío—ambos respaldados por nuestra garantía de 6 meses."
    }
  }[locale];

  return (
    <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
      <header className="text-center space-y-4">
        <h1 className="text-3xl lg:text-4xl font-extrabold">
          {t.title}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </header>

      <section className="grid gap-12 md:grid-cols-2">
        {CHARGER_MODULES.map((m) => (
          <OptionSelectorCard key={m.id} module={m} />
        ))}
      </section>

      <ChargerModuleTrustBadges />
    </main>
  );
} 