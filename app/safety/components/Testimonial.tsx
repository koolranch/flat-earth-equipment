export default function Testimonial() {
  const reviews = [
    {
      quote: "Needed this for a job interview the next day. Took 30 mins, printed the card, got the job. Super easy.",
      author: "James D.",
      title: "Warehouse Operator",
      initial: "JD"
    },
    {
      quote: "We certified 12 operators in one afternoon — saved over $400 versus classroom training.",
      author: "Jake M.",
      title: "Maintenance Manager",
      initial: "JM"
    },
    {
      quote: "Clear and to the point. Didn't put me to sleep like the old VHS training tapes we used to watch.",
      author: "Mike R.",
      title: "Forklift Operator",
      initial: "MR"
    }
  ];

  return (
    <section aria-labelledby="testimonial-heading" className="py-16 md:py-24 bg-slate-50/50 border-y border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="testimonial-heading" className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900 tracking-tight">
          What Operators Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review, idx) => (
            <div 
              key={review.initial} 
              className={`p-8 bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col ${idx === 2 ? 'hidden md:flex' : ''}`}
            >
              {/* Stars FIRST */}
              <div className="flex gap-0.5 text-yellow-400 mb-5 text-sm">
                ★★★★★
              </div>
              
              {/* Quote */}
              <p className="text-slate-700 mb-8 leading-relaxed text-lg flex-grow relative">
                <span className="absolute -top-3 -left-2 text-4xl text-slate-200 font-serif opacity-50">“</span>
                {review.quote}
              </p>
              
              {/* Author with Initial Avatar */}
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
                <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center font-bold text-orange-600 text-sm shadow-sm">
                  {review.initial}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{review.author}</p>
                  <p className="text-sm text-slate-500 font-medium">{review.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

