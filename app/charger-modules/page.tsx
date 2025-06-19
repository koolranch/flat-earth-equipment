import { CHARGER_MODULES } from "../../constants/chargerOptions";
import OptionSelectorCard from "@/components/OptionSelectorCard";
import TrustBadges from "@/components/TrustBadges";

export const metadata = {
  title: "Forklift Charger Modules | Enersys & Hawker | Exchange & Repair | Flat Earth Equipment",
  description: "In-stock remanufactured forklift charger modules for Enersys & Hawker. Choose instant exchange or send-in repair service. 6-month warranty, same-day shipping.",
  keywords: "forklift charger modules, enersys charger module, hawker charger module, forklift charger repair, charger module exchange",
};

export default function ChargersLanding() {
  return (
    <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
      <header className="text-center space-y-4">
        <h1 className="text-3xl lg:text-4xl font-extrabold">
          In-Stock Reman & Repair Charger Modules
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose instant exchange or send-in repair—both backed by our 6-month warranty.
        </p>
      </header>

      <section className="grid gap-12 md:grid-cols-2">
        {CHARGER_MODULES.map((m) => (
          <OptionSelectorCard key={m.id} module={m} />
        ))}
      </section>

      <TrustBadges />
    </main>
  );
} 