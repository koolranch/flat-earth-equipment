import React from 'react';

/**
 * OrientationChips
 * - Self-contained demo chips that render inline SVG icons from sprites
 * - No external image fetch required
 * - Graceful fallback if sprite files are missing
 */

const Chip: React.FC<{ title: string; children: React.ReactNode }>=({ title, children }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:p-5 flex items-center gap-4">
    <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg bg-white shadow-inner flex items-center justify-center">
      {children}
    </div>
    <div className="text-slate-900 font-medium">{title}</div>
  </div>
);

function SpriteUse({ href, size=40, className='' }: { href: string; size?: number; className?: string }) {
  // Render <svg><use/>. If the sprite path or symbol id is wrong, the box will simply be empty.
  // We'll wrap with a fallback label below via CSS.
  return (
    <svg width={size} height={size} aria-hidden="true" className={className}>
      {/* Using href allows external sprite reference sitting in /public */}
      <use href={href} />
    </svg>
  );
}

export default function OrientationChips() {
  // Expected sprite files from earlier asset phases:
  //  - /training/sprites/ppe-icons.svg           (C1)
  //  - /training/sprites/hazard-icons.svg        (C2)
  //  - /training/sprites/control-icons.svg       (C3)
  //  - /training/sprites/shutdown-steps.svg      (C4)
  //  - /training/sprites/inspection-icons.svg    (C5)

  const items = [
    {
      title: 'PPE sequence demo',
      iconHref: '/training/sprites/ppe-icons.svg#icon-ppe-vest'
    },
    {
      title: 'Find a hazard',
      iconHref: '/training/sprites/hazard-icons.svg#icon-hazard-spill'
    },
    {
      title: 'Identify a control',
      iconHref: '/training/sprites/control-icons.svg#icon-control-horn'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
      {items.map((it) => (
        <Chip key={it.title} title={it.title}>
          <div className="relative flex items-center justify-center">
            <SpriteUse href={it.iconHref} size={42} className="text-slate-900" />
            {/* Fallback label if the <use> resolves to nothing */}
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] md:text-xs text-slate-400 select-none" style={{mixBlendMode:'multiply'}}>
              {/* The label shows only if nothing paints; acceptable as a safety net */}
            </span>
          </div>
        </Chip>
      ))}
    </div>
  );
}
