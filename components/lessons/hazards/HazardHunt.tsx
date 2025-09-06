"use client";
import * as React from "react";
import { scenes } from "./hazards.config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function track(name: string, data?: Record<string, any>) {
  try {
    (window as any).analytics?.track?.(name, { name, ts: Date.now(), ...data });
    if (process.env.NODE_ENV !== "production") console.log("[analytics]", name, data);
  } catch {}
}

function useQueryParam(key: string) {
  const [val, setVal] = React.useState<string | null>(null);
  React.useEffect(() => {
    const u = new URL(window.location.href);
    setVal(u.searchParams.get(key));
  }, [key]);
  return val;
}

export default function HazardHunt() {
  const [sceneIdx, setSceneIdx] = React.useState(0);
  const [found, setFound] = React.useState<Record<string, Record<string, boolean>>>({}); // sceneId -> hotspotId -> bool
  const [startedAt] = React.useState<number>(() => Date.now());
  const debug = useQueryParam("debug") === "1";
  const timeLimitSec = Number(useQueryParam("time")) || 0; // optional timer via ?time=120
  const [now, setNow] = React.useState(Date.now());

  const scene = scenes[sceneIdx];
  const total = scene.hotspots.length;
  const foundMap = found[scene.id] || {};
  const foundCount = Object.values(foundMap).filter(Boolean).length;
  const done = foundCount === total;

  React.useEffect(() => {
    track("demo_start", { demo: "hazard_hunt", scene: scene.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    track("sim_param_change", { demo: "hazard_hunt", scene: scene.id, index: sceneIdx });
  }, [scene.id, sceneIdx]);

  React.useEffect(() => {
    if (!timeLimitSec) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [timeLimitSec]);

  const secondsLeft = timeLimitSec ? Math.max(0, timeLimitSec - Math.floor((now - startedAt) / 1000)) : null;
  const timeUp = timeLimitSec ? secondsLeft === 0 : false;

  const onPick = (hotspotId: string) => {
    if (done || timeUp) return;
    setFound((prev) => {
      const next = { ...prev } as typeof prev;
      next[scene.id] = { ...(next[scene.id] || {}), [hotspotId]: true };
      return next;
    });
    const hs = scene.hotspots.find((h) => h.id === hotspotId);
    track("quiz_item_answered", { demo: "hazard_hunt", correct: true, hazard: hs?.type, hotspotId, scene: scene.id });
  };

  const onNextScene = () => {
    if (sceneIdx < scenes.length - 1) {
      setSceneIdx((n) => n + 1);
    } else {
      track("demo_complete", { demo: "hazard_hunt", totalScenes: scenes.length });
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          <span className="text-slate-900">Hazard Spotting</span>
          <span className="text-sm text-slate-500">Scene {sceneIdx + 1} / {scenes.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
          <div>
            Found <span className="font-semibold">{foundCount}</span> / {total}
          </div>
          {secondsLeft !== null && (
            <div aria-live="polite" className={secondsLeft <= 10 ? "text-orange-700 font-semibold" : ""}>
              Time left: {secondsLeft}s
            </div>
          )}
        </div>

        {/* Scene stage (16:10-ish) */}
        <div className="relative w-full overflow-hidden rounded-2xl border bg-white" style={{ aspectRatio: "1200 / 800" }}>
          <img src={scene.image} alt={scene.title} className="h-full w-full object-cover select-none" draggable={false} />

          {scene.hotspots.map((h) => {
            const isFound = !!foundMap[h.id];
            const style: React.CSSProperties = {
              position: "absolute",
              left: `${h.xPct}%`,
              top: `${h.yPct}%`,
              width: `${h.wPct}%`,
              height: `${h.hPct}%`,
              transform: "translate(-0%, -0%)",
            };
            return (
              <button
                key={h.id}
                aria-label={isFound ? `${h.label} (found)` : `Mark hazard: ${h.label}`}
                onClick={() => onPick(h.id)}
                disabled={isFound}
                style={style}
                className={`group rounded-md outline-none transition focus-visible:ring-2 focus-visible:ring-orange-600 ${
                  isFound ? "pointer-events-none" : "hover:ring-2 hover:ring-orange-400/70"
                }`}
              >
                {/* Visual affordance (debug or discovered) */}
                <div
                  className={`${isFound ? "bg-orange-500/25 ring-2 ring-orange-600" : debug ? "bg-orange-500/10 ring-1 ring-orange-400/60" : "bg-transparent"} h-full w-full rounded-md`}
                />
              </button>
            );
          })}

          {/* Block input overlay if time is up */}
          {timeUp && (
            <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
              <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
                <div className="text-lg font-semibold text-slate-900">Time's up</div>
                <div className="text-slate-600">You found {foundCount} of {total} hazards.</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-sm text-slate-600">{scene.title}</div>
          {done ? (
            <Button onClick={onNextScene}>{sceneIdx < scenes.length - 1 ? "Next Scene →" : "Finish"}</Button>
          ) : (
            <div className="text-sm text-slate-500">Find all hazards to continue</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
