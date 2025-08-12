export default function ChargerFAQ() {
  const faqs = [
    {
      q: "How do I pick the right forklift battery charger?",
      a: "Match your battery voltage (24V/36V/48V/80V), choose an output current (amps) that fits your charge window, and confirm your facility input power (single-phase 208–240V or three-phase 480V/600V)."
    },
    {
      q: "What amperage do I need?",
      a: "As a rough guide for lead-acid, charge time ≈ (battery Ah ÷ charger A) × 1.2. Example: 750Ah battery with a 75A charger ≈ 12 hours. Faster chargers reduce turnaround but may require different circuits."
    },
    {
      q: "Can I use single-phase instead of three-phase?",
      a: "If your facility doesn't have 3-phase, select a single-phase model (typically 208–240V). Three-phase units are usually more efficient at higher currents."
    },
    {
      q: "Does chemistry matter (lead-acid vs lithium)?",
      a: "Yes. Most models here support lead-acid/AGM/gel. Lithium batteries may require specific profiles/BMS communication—verify your battery manufacturer's charger requirements."
    },
    {
      q: "What if I'm not sure?",
      a: "Use the selector to narrow options, then click Request a Quote—tell us your forklift make/model, battery voltage and Ah, and we'll confirm compatibility before you buy."
    }
  ];

  return (
    <section className="mt-12 rounded-2xl border bg-white p-6">
      <h2 className="text-xl font-semibold tracking-tight">Forklift Charger FAQ</h2>
      <div className="mt-4 divide-y">
        {faqs.map((f, i) => (
          <details key={i} className="py-4 group">
            <summary className="cursor-pointer list-none text-base font-medium">{f.q}</summary>
            <p className="mt-2 text-sm text-neutral-700">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
