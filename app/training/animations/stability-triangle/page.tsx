import StabilityTriangleCOG from "@/components/animations/StabilityTriangleCOG";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Stability Triangle — Preview</h1>
      <p className="text-slate-600">Animated COG motion within the forklift stability triangle. Honors reduced-motion preferences.</p>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <StabilityTriangleCOG className="w-full" />
      </div>
    </main>
  );
}
