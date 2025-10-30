export default function Testimonial() {
  return (
    <section aria-labelledby="testimonial-heading" className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-10">
        <h3 id="testimonial-heading" className="text-xl font-semibold tracking-tight text-slate-900">Teams get certified faster</h3>
        <blockquote className="mt-4 text-slate-700">
          <p>"We certified 12 operators in one afternoon — saved over $400 versus classroom training."</p>
        </blockquote>
        <div className="mt-3 text-sm text-slate-500">— Jake M., Maintenance Manager</div>
        <div className="mt-4 text-xs text-slate-500">Average completion time across operators is typically under 1 hour.</div>
      </div>
    </section>
  );
}

