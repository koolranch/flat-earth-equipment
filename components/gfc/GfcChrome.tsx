/**
 * Minimal Forklift Certified chrome shown only on app.getforkliftcertified.com.
 *
 * Hidden by default via CSS; an inline pre-paint script in the root layout sets
 * html[data-brand-host="gfc"] on that host, which hides the FEE navbar/footer
 * ([data-fee-chrome]) and reveals these ([data-gfc-chrome]) instead. This keeps
 * every page statically renderable — no headers() call in the layout.
 */

const GFC_MARKETING_URL = 'https://www.getforkliftcertified.com';

export function GfcHeader() {
  return (
    <header data-gfc-chrome className="border-b border-slate-200 bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <a href={GFC_MARKETING_URL} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F76511]">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12V6a1 1 0 0 1 1-1h3l3 5v2" />
              <path d="M4 17h12" />
              <circle cx="6" cy="19" r="2" />
              <circle cx="14" cy="19" r="2" />
              <path d="M19 5v11" />
              <path d="M19 16h3" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Forklift Certified
          </span>
        </a>
        <a
          href="mailto:support@getforkliftcertified.com"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Support
        </a>
      </div>
    </header>
  );
}

export function GfcFooter() {
  return (
    <footer data-gfc-chrome className="mt-10 border-t border-slate-200 bg-white">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-slate-500">
        <span>© Forklift Certified</span>
        <nav className="flex gap-4">
          <a href={`${GFC_MARKETING_URL}/terms`} className="hover:text-slate-700 underline hover:no-underline">
            Terms
          </a>
          <a href={`${GFC_MARKETING_URL}/privacy`} className="hover:text-slate-700 underline hover:no-underline">
            Privacy
          </a>
          <a href="mailto:support@getforkliftcertified.com" className="hover:text-slate-700 underline hover:no-underline">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
