// app/module/inspection/demo/hotspots/page.tsx
"use client";
import { DemoPanel } from "@/components/DemoPanel";
import { HotspotsEight } from "@/components/games/module2/HotspotsEight";
import GuideSection from '@/components/guides/GuideSection';
import { moduleGuides } from '@/content/guides/modules';

export default function HotspotsEightPage() {
  const guides = moduleGuides['eight-point-inspection']?.guides || [];

  return (
    <main className="container mx-auto p-4 md:p-6 space-y-4">
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

      {/* OSHA Guide Cards */}
      {guides.length > 0 && (
        <section className='space-y-2'>
          <h2 className='text-lg font-semibold text-[#0F172A] dark:text-white'>Guides</h2>
          <GuideSection guides={guides} />
        </section>
      )}
    </main>
  );
}
