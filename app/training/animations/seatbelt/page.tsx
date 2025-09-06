import SeatbeltLatch from "@/components/animations/SeatbeltLatch";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Seatbelt Latch — Preview</h1>
      <p className="text-slate-600">This page previews the animated SVG used in Module 1 (PPE/Safety sequence). It honors reduced-motion preferences.</p>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <SeatbeltLatch className="w-full" />
      </div>
    </main>
  );
}
