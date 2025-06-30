import { Metadata } from "next";
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: "Contact Us | Flat Earth Equipment",
  description: "Get in touch with Flat Earth Equipment for parts inquiries, rentals, and support.",
  alternates: { canonical: '/contact' }
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <ContactForm />
    </main>
  );
} 