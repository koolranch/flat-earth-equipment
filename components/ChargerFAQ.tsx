export default function ChargerFAQ() {
  const faqs = [
    {
      q: "How do I choose the right forklift battery charger?",
      a: "Match your battery voltage exactly (24V/36V/48V/80V), calculate required amperage based on your charging window, and confirm your facility's power input (single-phase 208–240V or three-phase 480V/600V). Consider your forklift brand compatibility and battery chemistry type. For detailed guidance, see our complete selection guide."
    },
    {
      q: "What amperage forklift charger do I need?",
      a: "Use this formula for lead-acid batteries: charge time ≈ (battery Ah ÷ charger A) × 1.2. Example: 750Ah battery with a 75A charger takes ~12 hours. For faster charging, choose higher amperage but ensure proper ventilation and electrical capacity."
    },
    {
      q: "What's the difference between 24V, 36V, 48V and 80V forklift chargers?",
      a: "24V chargers are for small pallet jacks and light-duty forklifts. 36V suits medium warehouse forklifts. 48V is most common for industrial applications. 80V is for heavy-duty, high-capacity forklifts. Always match your battery voltage exactly."
    },
    {
      q: "Can I use a single-phase forklift charger instead of three-phase?",
      a: "Yes, if your facility doesn't have 3-phase power, choose a single-phase model (208–240V input). Three-phase chargers are more efficient for higher amperage applications but require industrial electrical infrastructure."
    },
    {
      q: "How long does it take to charge a forklift battery?",
      a: "Standard overnight charging takes 8-12 hours with conventional chargers. Fast charging reduces this to 4-6 hours but requires higher amperage chargers and proper battery cooling. Charging time depends on battery capacity and charger output."
    },
    {
      q: "Do forklift chargers work with lithium and lead-acid batteries?",
      a: "Most industrial chargers support lead-acid, AGM, and gel batteries. Lithium batteries often require specific charging profiles and BMS communication. Verify compatibility with your battery manufacturer before purchasing."
    },
    {
      q: "What brands of forklifts do these chargers work with?",
      a: "Our chargers are compatible with all major forklift brands including Crown, Toyota, Yale, Hyster, Caterpillar, Nissan, Raymond, and more. Compatibility depends on battery voltage and connector type, not forklift brand."
    },
    {
      q: "How do I troubleshoot a forklift charger that's not working?",
      a: "Check power connections, verify correct voltage settings, inspect fuses/breakers, and ensure proper ventilation. Common issues include loose connections, incorrect voltage selection, or thermal shutoff activation. Contact our technical support for detailed troubleshooting."
    },
    {
      q: "What's the difference between fast charging and overnight charging?",
      a: "Overnight charging (8-12 hours) uses lower amperage and is gentler on batteries, extending battery life. Fast charging (4-6 hours) uses higher amperage for quicker turnaround but may reduce battery lifespan and requires better ventilation."
    },
    {
      q: "Do you offer installation and technical support?",
      a: "Yes, we provide professional installation assistance, technical support, and troubleshooting guidance. Our experts can help with electrical requirements, proper setup, and ongoing maintenance for optimal charger performance."
    }
  ];

  return (
    <section className="mt-12 rounded-2xl border bg-white p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Forklift Battery Charger FAQ</h2>
      <p className="text-gray-600 mb-6">Common questions about choosing, installing, and troubleshooting forklift battery chargers</p>
      <div className="mt-4 divide-y">
        {faqs.map((f, i) => (
          <details key={i} className="py-4 group">
            <summary className="cursor-pointer list-none text-base font-medium">{f.q}</summary>
            <p className="mt-2 text-sm text-neutral-700">{f.a}</p>
          </details>
        ))}
      </div>
      
      {/* FAQ Resources */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Need More Detailed Information?</h3>
        <div className="space-y-2 text-sm">
          <div>
            📚 <a href="/insights/complete-guide-forklift-battery-chargers" className="text-blue-600 hover:text-blue-800 font-medium">
              Complete Guide to Forklift Battery Chargers (2025)
            </a>
          </div>
          <div>
            📖 <a href="/insights/how-to-choose-forklift-battery-charger" className="text-green-600 hover:text-green-800 font-medium">
              How to Choose a Forklift Battery Charger
            </a>
          </div>
          <div>
            ⚡ <a href="/insights/fast-vs-overnight-forklift-charging" className="text-orange-600 hover:text-orange-800 font-medium">
              Fast vs Overnight Charging Comparison
            </a>
          </div>
          <div>
            🔧 <a href="/insights/forklift-charger-voltage-comparison" className="text-purple-600 hover:text-purple-800 font-medium">
              24V vs 36V vs 48V vs 80V Voltage Guide
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
