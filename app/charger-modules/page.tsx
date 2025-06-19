import { CHARGER_MODULES } from "@/constants/chargerOptions";
import OptionSelectorCard from "@/components/OptionSelectorCard";
import TrustBar from "@/components/TrustBar";

export const metadata = {
  title: "Reman Forklift Charger Modules | Flat Earth Equipment",
  description: "Exchange or Repair forklift charger modules online. Western-tough warranty.",
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

      <TrustBar className="mt-20" />
    </main>
  );
} 