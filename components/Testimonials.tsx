import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Flat Earth got us Genie parts overnight. No backorders, no nonsense.",
    author: "Fleet Manager",
    company: "Montana Distribution"
  },
  {
    quote: "Our warehouse lift was down. These guys had the joystick in stock and on a truck within hours.",
    author: "Maintenance Supervisor",
    company: "Wyoming Logistics"
  },
  {
    quote: "Parts arrived in 24 hours, fit perfectly, and cost less than OEM.",
    author: "Service Director",
    company: "Colorado Equipment"
  }
];

export default function Testimonials() {
  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center text-slate-800 mb-8">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <p className="italic text-slate-800 font-medium mb-2">"Flat Earth got us Genie parts overnight. No backorders, no nonsense."</p>
            <p className="text-xs text-slate-500">– Fleet Manager, Montana</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <p className="italic text-slate-800 font-medium mb-2">"Our warehouse lift was down. These guys had the joystick in stock and on a truck within hours."</p>
            <p className="text-xs text-slate-500">– Maintenance Supervisor, Wyoming</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <p className="italic text-slate-800 font-medium mb-2">"Parts arrived in 24 hours, fit perfectly, and cost less than OEM."</p>
            <p className="text-xs text-slate-500">– Service Director, Colorado</p>
          </div>
        </div>
      </div>
    </section>
  );
} 