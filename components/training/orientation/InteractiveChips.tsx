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
      <p className="mb-3 text-slate-600">Tap items in order: Vest → Hard hat → Seatbelt</p>
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
            className={`flex h-20 items-center justify-center rounded-xl border p-3 text-sm font-medium transition ${i < idx ? "border-green-500 bg-green-50 text-green-700" : i === idx ? "border-slate-300 hover:bg-slate-50" : "border-slate-200 opacity-60"}`}
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
    <div className="relative aspect-[16/9] w-full rounded-xl border border-slate-200 bg-white">
      {/* Simple aisle scene */}
      <div className="absolute inset-x-6 bottom-6 h-12 rounded bg-slate-200"/>
      {/* Clickable hazard zone */}
      <button
        aria-label="Hazard spill hotspot"
        className="absolute left-1/2 top-1/2 h-14 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-orange-500/60 bg-orange-500/10 hover:bg-orange-500/20"
        onClick={onComplete}
      />
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
      <p className="mb-3 text-slate-600">Which one is the horn control?</p>
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
    <div className="mt-4">
      <div className="mb-3 text-slate-500">Tap each step. This is how the demos feel.</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button onClick={() => setOpen("ppe")} className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/90 p-4 text-left text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-slate-900"><VestIcon/></div>
          <div className="font-medium">PPE sequence demo</div>
        </button>
        <button onClick={() => setOpen("hazard")} className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/90 p-4 text-left text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-slate-900"><HazardIcon/></div>
          <div className="font-medium">Find a hazard</div>
        </button>
        <button onClick={() => setOpen("control")} className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/90 p-4 text-left text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-slate-900"><ControlIcon/></div>
          <div className="font-medium">Identify a control</div>
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
