"use client";
import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/content/assets/manifest';
import { track } from '@/lib/analytics';

// Base viewBox for background SVGs
const VW = 1200;
const VH = 800;

type Hotspot = {
  id: string;
  x: number; // pixel coords in 1200x800 space
  y: number;
  r: number; // radius in px
  labelKey: string; // i18n key
  iconId?: string; // optional symbol id from hazard sprite
  explainKey?: string; // i18n info
};

type Scenario = {
  id: string;
  titleKey: string;
  bgAssetId: keyof typeof ASSETS;
  hotspots: Hotspot[];
  targetCount: number; // number you must find to pass
};

const scenarios: Scenario[] = [
  {
    id: 'warehouse_bay',
    titleKey: 'module4.scenes.bay',
    bgAssetId: 'B1_warehouse_bay',
    targetCount: 5,
    hotspots: [
      { id: 'spill', x: 740, y: 646, r: 42, labelKey: 'hazards.spill', iconId: 'icon-hazard-spill' },
      { id: 'ped', x: 460, y: 605, r: 70, labelKey: 'hazards.pedestrian', iconId: 'icon-hazard-pedestrian' },
      { id: 'overhead', x: 1015, y: 198, r: 60, labelKey: 'hazards.overhead', iconId: 'icon-hazard-overhead' },
      { id: 'unstable', x: 1032, y: 450, r: 80, labelKey: 'hazards.unstable', iconId: 'icon-hazard-unstable-load' },
      { id: 'speed', x: 800, y: 645, r: 90, labelKey: 'hazards.speed', iconId: 'icon-hazard-speed-zone' }
    ]
  },
  {
    id: 'blind_corner',
    titleKey: 'module4.scenes.corner',
    bgAssetId: 'B2_blind_corner',
    targetCount: 4,
    hotspots: [
      { id: 'corner', x: 960, y: 420, r: 75, labelKey: 'hazards.blindCorner', iconId: 'icon-hazard-blind-corner' },
      { id: 'ped', x: 600, y: 460, r: 60, labelKey: 'hazards.pedestrian', iconId: 'icon-hazard-pedestrian' },
      { id: 'spill', x: 300, y: 660, r: 44, labelKey: 'hazards.spill', iconId: 'icon-hazard-spill' },
      { id: 'speed', x: 600, y: 635, r: 110, labelKey: 'hazards.speed', iconId: 'icon-hazard-speed-zone' }
    ]
  },
  {
    id: 'dock_ramp',
    titleKey: 'module4.scenes.ramp',
    bgAssetId: 'B3_dock_ramp',
    targetCount: 4,
    hotspots: [
      { id: 'ramp', x: 560, y: 588, r: 120, labelKey: 'hazards.rampSlope', iconId: 'icon-hazard-ramp-slope' },
      { id: 'edge', x: 900, y: 560, r: 44, labelKey: 'hazards.dockEdge', iconId: 'icon-hazard-dock-edge' },
      { id: 'unstable', x: 1034, y: 576, r: 70, labelKey: 'hazards.unstable', iconId: 'icon-hazard-unstable-load' },
      { id: 'ped', x: 520, y: 690, r: 80, labelKey: 'hazards.pedestrian', iconId: 'icon-hazard-pedestrian' }
    ]
  }
];

function pct(n: number, base: number) { return (n / base) * 100 + '%'; }

export default function HazardHunt() {
  const [sceneIdx, setSceneIdx] = React.useState(0);
  const scene = scenarios[sceneIdx];
  const [found, setFound] = React.useState<string[]>([]);
  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);

  React.useEffect(() => {
    setFound([]);
    setStarted(false);
    setFinished(false);
  }, [sceneIdx]);

  const onStart = () => {
    setStarted(true);
    track('demo_start', { module: 4, demo: 'hazard_hunt', scene: scene.id });
  };

  const onClickHotspot = (id: string) => {
    if (!started || finished) return;
    if (found.includes(id)) return;
    setFound(prev => [...prev, id]);
    track('hazard_found', { module: 4, scene: scene.id, id, count: found.length + 1 });
    if (found.length + 1 >= scene.targetCount) {
      setFinished(true);
      track('demo_complete', { module: 4, scene: scene.id, total_found: scene.targetCount });
    }
  };

  const bg = ASSETS[scene.bgAssetId];

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium">Scene</label>
        <select
          className="rounded-md border px-2 py-1"
          value={sceneIdx}
          onChange={e => setSceneIdx(parseInt(e.target.value))}
        >
          {scenarios.map((s, i) => (
            <option key={s.id} value={i}>{s.titleKey}</option>
          ))}
        </select>
        <button
          className="ml-2 rounded-lg bg-orange-600 px-3 py-1.5 text-white disabled:opacity-50"
          onClick={onStart}
          disabled={started}
        >Start</button>
        <div className="ml-auto text-sm text-slate-600">
          Found: {found.length} / {scene.targetCount}
        </div>
      </div>

      <div className="relative w-full" style={{ aspectRatio: `${VW} / ${VH}` }}>
        {/* Background */}
        <Image src={bg.src} alt={bg.alt} fill priority sizes="(max-width: 1200px) 100vw, 1200px" className="object-contain" />

        {/* Hotspots */}
        {scene.hotspots.map(h => (
          <button
            key={h.id}
            aria-label={h.labelKey}
            onClick={() => onClickHotspot(h.id)}
            className={`absolute rounded-full border-2 transition ${found.includes(h.id) ? 'border-emerald-500 bg-emerald-500/20' : 'border-orange-600 bg-orange-600/10'} hover:scale-105`}
            style={{
              left: `calc(${pct(h.x, VW)} - ${h.r}px)`,
              top: `calc(${pct(h.y, VH)} - ${h.r}px)`,
              width: `${h.r * 2}px`,
              height: `${h.r * 2}px`
            }}
          />
        ))}
      </div>

      <div className="mt-4">{
        finished ? (
          <div className="rounded-xl border bg-emerald-50 p-4 text-emerald-900">
            <div className="font-semibold">Nice work.</div>
            <div className="text-sm">You found the required hazards. Continue to the quiz or next lesson.</div>
          </div>
        ) : (
          <div className="rounded-xl border bg-slate-50 p-4 text-slate-900">
            <div className="font-semibold">Find the hazards.</div>
            <div className="text-sm">Tap the orange zones. Progress saves automatically.</div>
          </div>
        )
      }</div>
    </div>
  );
}
