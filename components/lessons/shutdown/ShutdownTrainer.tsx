"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SeatbeltLatch from "@/components/animations/SeatbeltLatch";
import ParkingBrakeSet from "@/components/animations/ParkingBrakeSet";
import ForksLower from "@/components/animations/ForksLower";
import ConnectCharger from "@/components/animations/ConnectCharger";
import StabilityTriangleCOG from "@/components/animations/StabilityTriangleCOG";

function track(name: string, data?: Record<string, any>) {
  const payload = { name, ts: Date.now(), ...data };
  try {
    // Your project-wide analytics hooks (fallbacks included)
    (window as any).analytics?.track?.(name, payload);
    window.dispatchEvent(new CustomEvent("analytics", { detail: payload }));
    // Optional: console breadcrumb for devs
    if (process.env.NODE_ENV !== "production") console.log("[analytics]", payload);
  } catch {}
}

const steps = [
  {
    id: "s1",
    title: "Buckle your seatbelt",
    desc: "Latch the belt before moving – it's non-negotiable.",
    component: <SeatbeltLatch className="w-full" />,
  },
  {
    id: "s2",
    title: "Set the parking brake",
    desc: "Engage the lever fully so the truck can't roll.",
    component: <ParkingBrakeSet className="w-full" />,
  },
  {
    id: "s3",
    title: "Lower forks to the ground",
    desc: "Bring forks fully down and level to remove stored energy.",
    component: <ForksLower className="w-full" />,
  },
  {
    id: "s4",
    title: "Key off and connect the charger",
    desc: "Turn the truck off, then connect the charge cable to the port.",
    component: <ConnectCharger className="w-full" />,
  },
  {
    id: "s5",
    title: "Stability check basics",
    desc: "Know how COG moves within the stability triangle.",
    component: <StabilityTriangleCOG className="w-full" />,
  },
] as const;

export default function ShutdownTrainer() {
  const [i, setI] = React.useState(0);
  const step = steps[i];
  const isFirst = i === 0;
  const isLast = i === steps.length - 1;

  React.useEffect(() => {
    track("demo_start", { demo: "shutdown_trainer", step: step.id });
    // fire on first mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    track("sim_param_change", { demo: "shutdown_trainer", step: step.id, index: i });
  }, [i, step?.id]);

  const onPrev = () => setI((n) => Math.max(0, n - 1));
  const onNext = () => {
    if (!isLast) setI((n) => Math.min(steps.length - 1, n + 1));
    else track("demo_complete", { demo: "shutdown_trainer" });
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          <span className="text-slate-900">Shutdown Trainer</span>
          <span className="text-sm text-slate-500">Step {i + 1} / {steps.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div aria-hidden className="h-2 w-full rounded bg-slate-100">
          <div className="h-2 rounded bg-orange-600" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
        </div>

        {/* Step title & desc */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">{step.title}</h2>
          <p className="text-slate-600">{step.desc}</p>
        </div>

        {/* Animation */}
        <div className={cn("rounded-2xl border bg-white p-3 md:p-4")}
             aria-label={`${step.title} animation`}>
          {step.component}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={onPrev} disabled={isFirst} aria-label="Previous step">
            ← Prev
          </Button>
          <Button onClick={onNext} aria-label={isLast ? "Finish trainer" : "Next step"}>
            {isLast ? "Finish" : "Next →"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
