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
    <section aria-labelledby="testimonial-heading" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="testimonial-heading" className="text-3xl font-bold text-center mb-12 text-slate-900 tracking-tight">
          What Operators Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review, idx) => (
            <div 
              key={review.initial} 
              className={`p-6 bg-slate-50 rounded-xl hover:shadow-lg transition-shadow duration-300 ${idx === 2 ? 'hidden md:block' : ''}`}
            >
              {/* Stars FIRST */}
              <div className="flex gap-1 text-yellow-400 mb-4">
                ★★★★★
              </div>
              {/* Quote */}
              <p className="text-slate-600 mb-6 leading-relaxed">"{review.quote}"</p>
              {/* Author with Initial Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                  {review.initial}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{review.author}</p>
                  <p className="text-xs text-slate-500">{review.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

