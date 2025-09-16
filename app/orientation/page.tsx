import 'server-only';
import dynamic from "next/dynamic";

const OrientationInteractiveChips = dynamic(() => import("@/components/training/orientation/InteractiveChips"), { ssr: false });

export default function Page(){
  return (
    <main className="section">
      <div className="container mx-auto px-4">
        <header className="panel shadow-card px-6 py-6 mb-8 text-center">
          <p className="text-xs uppercase tracking-wide text-brand-orangeBright/80 mb-2">Flat Earth Safety</p>
          <h1 className="text-display font-semibold text-brand-onPanel mb-2">Orientation</h1>
          <p className="text-brand-onPanel/90 text-lg">Get certified. No fluff. Learn by doing.</p>
        </header>
        
        <section className="panel-soft shadow-card px-6 py-6 mb-6">
          <h2 className="text-2xl font-semibold text-brand-onPanel mb-4">How this works</h2>
          <ul className="list-disc pl-6 text-base leading-7 text-brand-onPanel/90 space-y-3">
            <li>Hands-on demos first. Short quizzes after each module.</li>
            <li>Pass the final exam. Your supervisor completes the practical evaluation.</li>
            <li>Certificates are issued instantly and saved to Records.</li>
          </ul>
        </section>
        
        <section className="panel-soft shadow-card px-6 py-6 mb-8">
          <h2 className="text-2xl font-semibold text-brand-onPanel mb-4">10-second warm-up</h2>
          <p className="text-brand-onPanel/70 text-sm mb-4">Tap each step. This is how the demos feel.</p>
          <OrientationInteractiveChips />
        </section>
        
        <div className="text-center">
          <a href="/training" className="btn-primary tappable" aria-label="Start safety training course">Start training</a>
        </div>
      </div>
    </main>
  );
}
