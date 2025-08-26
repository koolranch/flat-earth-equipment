// app/module/inspection/demo/hotspots/page.tsx
import { DemoPanel } from "@/components/DemoPanel";
import { HotspotsEight } from "@/components/games/module2/HotspotsEight";

export default function HotspotsEightPage() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <DemoPanel
        title="8-Point Inspection"
        objective="Complete the required 8-point safety inspection before operating the forklift."
        steps={[
          "Click each orange hotspot to inspect that area",
          "Read the inspection criteria for each point", 
          "Ensure all 8 points are checked before proceeding"
        ]}
        onStart={() => {
          console.log("Starting 8-point inspection demo");
        }}
        onComplete={() => {
          console.log("8-point inspection demo completed");
        }}
      >
        <HotspotsEight 
          onComplete={() => {
            console.log("All 8 inspection points completed!");
          }} 
        />
      </DemoPanel>
    </main>
  );
}
