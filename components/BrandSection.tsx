import { ReactNode } from "react";

export default function BrandSection({ title, subtitle, actions, children }: { title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode; }) {
  return (
    <section className="brand-section p-4 sm:p-5">
      {(title || subtitle || actions) && (
        <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && <h2 className="h1">{title}</h2>}
            {subtitle && <p className="subtle text-sm sm:text-base">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}


