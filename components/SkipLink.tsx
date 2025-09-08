export default function SkipLink(){
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 shadow"
    >
      Skip to content
    </a>
  );
}
