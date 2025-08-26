// app/module/pre-op/demo/minippe/page.tsx (example wrapper)
"use client";
import { DemoPanel } from "@/components/DemoPanel";
import MiniPPE from "@/components/games/module1/MiniPPE";

export default function MiniPPEPage() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <DemoPanel
        title="MiniPPE"
        objective="Practice the required PPE sequence before operating."
        steps={["Select the correct PPE", "Apply in the right order", "Confirm readiness"]}
        onStart={() => {
          // Optional: Add any custom logic here
          console.log("Starting MiniPPE demo");
        }}
        onComplete={() => {
          // Optional: Add any custom completion logic here
          console.log("MiniPPE demo completed");
        }}
      >
        <MiniPPE 
          onComplete={() => { /* unlock Continue UI, toast, etc. */ }} 
          openGuide={() => { console.log("Open guide requested"); }}
        />
      </DemoPanel>
    </main>
  );
}
