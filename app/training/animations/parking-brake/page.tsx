import ParkingBrakeSet from "@/components/animations/ParkingBrakeSet";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Parking Brake — Preview</h1>
      <p className="text-slate-600">This page previews the animated SVG used in the shutdown/PPE sequence. It honors reduced-motion preferences.</p>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <ParkingBrakeSet className="w-full" />
      </div>
    </main>
  );
}
