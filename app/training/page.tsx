import { Metadata } from "next";
import CourseCard from "@/components/CourseCard";

export const metadata: Metadata = {
  title: "Safety Training & Certification | Flat Earth Equipment",
  description: "OSHA-compliant forklift operator courses and safety micro-modules. Train the Western-tough way.",
};

export default function TrainingHome() {
  return (
    <main className="container mx-auto px-4 lg:px-8 py-12 space-y-20">
      {/* HERO */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold">
          Training & Certification
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Online OSHA-compliant courses that keep your crew safe and your
          fleet moving.
        </p>
      </section>

      {/* COURSE GRID */}
      <section className="grid gap-10 md:grid-cols-2">
        <CourseCard
          title="Forklift Operator Certification"
          href="/safety"
          badge="OSHA"
          price="$59"
          img="/images/courses/forklift-cert.jpg"
        />
        <CourseCard
          title="Safety Micro-Modules"
          href="/training/safety-modules"
          badge="NEW"
          price="From $19"
          img="/images/courses/safety-modules.jpg"
        />
      </section>
    </main>
  );
} 