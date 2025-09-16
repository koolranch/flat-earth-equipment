/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";

/** Inline, brand-safe SVG icons so chips never appear blank */
const VestIcon = () => (
  <svg viewBox="0 0 128 128" className="h-8 w-8" aria-hidden>
    <rect x="22" y="20" width="84" height="92" rx="10" fill="#E5E7EB" stroke="#0F172A" strokeWidth="1.8"/>
    <rect x="60" y="20" width="8" height="92" fill="#fff"/>
    <rect x="28" y="64" width="30" height="8" rx="3" fill="#F76511"/>
    <rect x="70" y="64" width="30" height="8" rx="3" fill="#F76511"/>
  </svg>
);
const HazardIcon = () => (
  <svg viewBox="0 0 128 128" className="h-8 w-8" aria-hidden>
    <circle cx="64" cy="64" r="40" fill="none" stroke="#F76511" strokeWidth="1.8"/>
    <path d="M22 96 C36 88, 62 90, 80 96 C96 100, 94 112, 72 116 C52 120, 28 116, 22 106 Z" fill="#E5E7EB" stroke="#0F172A" strokeWidth="1.8"/>
  </svg>
);
const ControlIcon = () => (
  <svg viewBox="0 0 128 128" className="h-8 w-8" aria-hidden>
    <path d="M24 64 H48 L72 48 L108 44 V84 L72 80 L48 64 Z" fill="#E5E7EB" stroke="#0F172A" strokeWidth="1.8"/>
    <path d="M108 54 q12 10 0 20" fill="none" stroke="#F76511" strokeWidth="1.8"/>
  </svg>
);

type DemoKey = "ppe" | "hazard" | "control" | null;

function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden></div>
      <div role="dialog" aria-modal="true" aria-label={title} className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-800 bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50" aria-label="Close demo">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PpeSequenceDemo({ onComplete }: { onComplete: () => void }) {
  const steps = ["Vest", "Hard hat", "Seatbelt"] as const;
  const [idx, setIdx] = React.useState(0);
  return (
    <div>
      <p className="mb-4 text-base text-slate-800 font-medium">Tap items in order: Vest → Hard hat → Seatbelt</p>
      <div className="grid grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => {
              if (i === idx) {
                const next = idx + 1;
                setIdx(next);
                if (next === steps.length) onComplete();
              }
            }}
            className={`tappable flex h-20 items-center justify-center rounded-xl border p-3 text-base font-semibold transition ${i < idx ? "border-green-500 bg-green-100 text-green-800" : i === idx ? "border-brand-orangeBright bg-brand-orangeBright/10 text-brand-ink hover:bg-brand-orangeBright/20" : "border-slate-300 bg-slate-100 text-slate-700"}`}
            aria-pressed={i < idx}
          >
            {i < idx ? "✓ " : ""}{s}
          </button>
        ))}
      </div>
    </div>
  );
}

function FindHazardDemo({ onComplete }: { onComplete: () => void }) {
  return (
    <div>
      <p className="mb-4 text-base text-slate-800 font-medium">Find and tap the <span className="font-semibold text-orange-700">orange spill hazard</span>.</p>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Minimal aisle scene background */}
        <svg viewBox="0 0 800 450" className="absolute inset-0 h-full w-full" aria-hidden>
          <rect x="0" y="0" width="800" height="450" fill="#FFFFFF"/>
          {/* Aisle strip */}
          <rect x="80" y="330" width="640" height="60" fill="#E5E7EB"/>
          {/* Left rack uprights */}
          <rect x="80" y="120" width="14" height="200" fill="#CBD5E1"/>
          <rect x="220" y="120" width="14" height="200" fill="#CBD5E1"/>
          {/* Right rack uprights */}
          <rect x="566" y="110" width="14" height="210" fill="#CBD5E1"/>
          <rect x="706" y="110" width="14" height="210" fill="#CBD5E1"/>
          {/* Beam hints */}
          <rect x="94" y="160" width="126" height="10" fill="#E5E7EB"/>
          <rect x="580" y="150" width="126" height="10" fill="#E5E7EB"/>
          {/* Spill shape (for visual) – button sits on top */}
          <path d="M430 350 C460 342, 500 346, 530 354 C550 360, 546 374, 514 378 C484 382, 446 376, 430 366 Z" fill="#F76511" fillOpacity="0.18" stroke="#F76511" strokeWidth="2"/>
        </svg>

        {/* Clickable hotspot (big, obvious, with pulsing ring) */}
        <button
          aria-label="Hazard spill hotspot"
          className="group absolute left-1/2 top-1/2 h-16 w-48 -translate-x-[10%] -translate-y-[5%] rounded-full border-2 border-dashed border-orange-500/80 bg-orange-500/20 outline-none transition hover:bg-orange-500/30 focus:ring-4 focus:ring-orange-300"
          onClick={onComplete}
          title="Tap hazard"
        >
          <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-orange-500/30 opacity-75 blur-[2px] group-hover:opacity-90"/>
          <span className="pointer-events-none absolute inset-0 rounded-full animate-ping bg-orange-500/25"/>
          <span className="relative text-sm font-semibold text-orange-800">Tap hazard</span>
        </button>
      </div>
    </div>
  );
}

function IdentifyControlDemo({ onComplete }: { onComplete: () => void }) {
  const CHOICES = [
    { key: "horn", label: "Horn", correct: true },
    { key: "tilt", label: "Tilt" },
    { key: "ign", label: "Ignition" }
  ];
  return (
    <div>
      <p className="mb-4 text-base text-slate-800 font-medium">Which one is the horn control?</p>
      <div className="grid grid-cols-3 gap-3">
        {CHOICES.map((c) => (
          <button
            key={c.key}
            onClick={() => c.correct && onComplete()}
            className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white p-3 hover:bg-slate-50"
            aria-label={c.label}
          >
            <div>{c.key === "horn" ? <ControlIcon/> : c.key === "tilt" ? <svg viewBox="0 0 128 128" className="h-8 w-8"><rect x="28" y="28" width="12" height="72" fill="#E5E7EB" stroke="#0F172A" strokeWidth="1.8"/><polygon points="44,50 86,54 86,72 44,68" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.8"/></svg> : <svg viewBox="0 0 128 128" className="h-8 w-8"><circle cx="48" cy="64" r="14" fill="#fff" stroke="#0F172A" strokeWidth="1.8"/><rect x="48" y="62" width="30" height="6" rx="3" fill="#CBD5E1"/></svg>}</div>
            <span className="text-sm font-medium text-slate-800">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OrientationInteractiveChips() {
  const [open, setOpen] = React.useState<DemoKey>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const close = () => setOpen(null);
  const onDone = () => {
    setToast("Nice! Demo complete.");
    setTimeout(() => setToast(null), 1500);
    close();
  };
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button 
          onClick={() => setOpen("ppe")} 
          className="tappable flex items-center gap-4 rounded-xl bg-brand-onPanel/5 border border-brand-onPanel/10 p-4 text-left text-brand-onPanel hover:bg-brand-onPanel/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orangeBright focus:ring-offset-2"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-orangeBright/20 text-brand-orangeBright"><VestIcon/></div>
          <div className="font-medium text-base">PPE sequence demo</div>
        </button>
        <button 
          onClick={() => setOpen("hazard")} 
          className="tappable flex items-center gap-4 rounded-xl bg-brand-onPanel/5 border border-brand-onPanel/10 p-4 text-left text-brand-onPanel hover:bg-brand-onPanel/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orangeBright focus:ring-offset-2"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-orangeBright/20 text-brand-orangeBright"><HazardIcon/></div>
          <div className="font-medium text-base">Find a hazard</div>
        </button>
        <button 
          onClick={() => setOpen("control")} 
          className="tappable flex items-center gap-4 rounded-xl bg-brand-onPanel/5 border border-brand-onPanel/10 p-4 text-left text-brand-onPanel hover:bg-brand-onPanel/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orangeBright focus:ring-offset-2"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-orangeBright/20 text-brand-orangeBright"><ControlIcon/></div>
          <div className="font-medium text-base">Identify a control</div>
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div role="status" className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 ring-1 ring-green-200">{toast}</div>
      )}

      {/* Modals */}
      <Modal open={open === "ppe"} onClose={close} title="PPE sequence">
        <PpeSequenceDemo onComplete={onDone} />
      </Modal>
      <Modal open={open === "hazard"} onClose={close} title="Find a hazard">
        <FindHazardDemo onComplete={onDone} />
      </Modal>
      <Modal open={open === "control"} onClose={close} title="Identify a control">
        <IdentifyControlDemo onComplete={onDone} />
      </Modal>
    </div>
  );
}
