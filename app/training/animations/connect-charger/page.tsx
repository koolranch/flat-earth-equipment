import ConnectCharger from "@/components/animations/ConnectCharger";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Connect Charger — Preview</h1>
      <p className="text-slate-600">Animated SVG honoring reduced-motion preferences. Shows cable draw-in and port status pulse.</p>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <ConnectCharger className="w-full" />
      </div>
    </main>
  );
}
