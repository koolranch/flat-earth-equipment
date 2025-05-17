import { Metadata } from "next";
import { getMDXContent } from "@/lib/mdx";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Nissan K21 Forklift Engine: Performance, Specifications, and Maintenance Insights",
  description: "Learn about the Nissan K21 forklift engine's performance, specifications, maintenance requirements, and common applications.",
  alternates: {
    canonical: "/insights/nissan-k21-forklift-engine",
  },
};

export default async function NissanK21EngineInsightsPage() {
  const mdxData = await getMDXContent("nissan-k21-forklift-engine");
  
  if (!mdxData) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-slate max-w-none">
        {mdxData.content}
      </article>
    </main>
  );
} 