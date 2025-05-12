import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Flat Earth Equipment",
  description: "Get in touch with Flat Earth Equipment for parts inquiries, rentals, and support.",
  alternates: { canonical: '/contact' }
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Contact Us</h1>
      <p className="text-slate-600 mb-8">
        Need help with a part, quote, or order? We're based in Sheridan, Wyoming and respond fast — usually within the hour during business hours.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Contact Info */}
        <div className="text-slate-700 text-sm space-y-4">
          <div>
            <h2 className="font-semibold text-base text-slate-800 mb-1">Corporate Office</h2>
            <p>30 N Gould St., Ste R<br />Sheridan, WY 82801</p>
          </div>

          <div>
            <h2 className="font-semibold text-base text-slate-800 mb-1">Support</h2>
            <p>Email: <a href="mailto:contat@flatearthequipment.com" className="text-canyon-rust underline">contat@flatearthequipment.com</a></p>
            <p>Phone: <a href="tel:+13073020043" className="text-canyon-rust underline">(307) 302-0043‬</a></p>
            <p>Hours: Monday–Friday, 7AM–5PM (Mountain Time)</p>
          </div>
        </div>

        {/* Right: Contact Form */}
        <form
          method="POST"
          action="https://formspree.io/f/mrbqkjke"
          className="space-y-4"
        >
          <input
            type="hidden"
            name="_subject"
            value="Contact Form Submission"
          />
          <input
            name="name"
            placeholder="Your Name"
            required
            className="w-full border border-slate-300 px-4 py-2 rounded"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full border border-slate-300 px-4 py-2 rounded"
          />
          <textarea
            name="message"
            placeholder="How can we help you?"
            rows={5}
            required
            className="w-full border border-slate-300 px-4 py-2 rounded"
          />
          <button
            type="submit"
            className="bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </main>
  );
} 