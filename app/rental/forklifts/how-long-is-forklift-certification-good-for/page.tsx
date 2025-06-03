import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: "How Long Does Forklift Certification Last? | 2024 OSHA Guide",
  description: "How long does forklift certification last? Get the complete guide to forklift certification duration, OSHA requirements, and renewal process. Updated for 2024.",
  alternates: {
    canonical: "/rental/forklifts/how-long-is-forklift-certification-good-for",
  },
  openGraph: {
    title: "How Long Does Forklift Certification Last? | 2024 OSHA Guide",
    description: "How long does forklift certification last? Get the complete guide to forklift certification duration, OSHA requirements, and renewal process. Updated for 2024.",
    url: "https://www.flatearthequipment.com/rental/forklifts/how-long-is-forklift-certification-good-for",
    type: "article",
  },
};

export default function ForkliftCertificationDurationPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        How Long Does Forklift Certification Last? (2024 Guide)
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          How long does forklift certification last? According to OSHA standards, forklift operator certifications 
          are valid for three years from the date of training. This comprehensive guide explains everything you need 
          to know about forklift certification duration, renewal requirements, and maintaining compliance.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">How Long Does Forklift Certification Last? OSHA Requirements</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Clock className="w-6 h-6 text-canyon-rust" />
              </div>
              <div>
                <h3 className="font-semibold">Standard Certification Duration</h3>
                <p className="mt-2">
                  How long does forklift certification last? OSHA requires forklift operator certifications to be valid 
                  for three years from the date of training. However, there are several circumstances that may require 
                  earlier recertification.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">When Recertification is Required</h2>
            <div className="bg-white border rounded-lg p-6">
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Accidents or Near-Misses:</strong> If an operator is involved in an accident or near-miss incident
                </li>
                <li>
                  <strong>Performance Issues:</strong> If an operator demonstrates unsafe operation
                </li>
                <li>
                  <strong>Equipment Changes:</strong> When operating a different type of forklift
                </li>
                <li>
                  <strong>Workplace Changes:</strong> When working conditions or environment changes significantly
                </li>
                <li>
                  <strong>Evaluation Failure:</strong> If an operator fails a performance evaluation
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Maintaining Certification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Regular Evaluations</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Annual performance reviews</li>
                  <li>Safety compliance checks</li>
                  <li>Operating skill assessments</li>
                  <li>Knowledge retention tests</li>
                </ul>
              </div>
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Documentation</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Keep training records</li>
                  <li>Maintain evaluation results</li>
                  <li>Document any incidents</li>
                  <li>Track recertification dates</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4 text-yellow-800">Important Safety Reminder</h3>
          <p className="text-yellow-700">
            While certification is valid for three years, operators should continuously practice safe operation 
            and stay updated on safety protocols. Regular training and evaluation are essential for maintaining 
            a safe workplace.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              href="/safety/forklift-certification"
              className="block p-6 border rounded-lg hover:border-canyon-rust transition"
            >
              <h3 className="text-lg font-semibold mb-2">Forklift Certification Training</h3>
              <p className="text-slate-600">
                Learn about our comprehensive forklift certification training programs and requirements.
              </p>
            </Link>
            <Link 
              href="/safety/workplace-safety"
              className="block p-6 border rounded-lg hover:border-canyon-rust transition"
            >
              <h3 className="text-lg font-semibold mb-2">Workplace Safety Guidelines</h3>
              <p className="text-slate-600">
                Essential safety guidelines and best practices for forklift operation.
              </p>
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-slate-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions About Forklift Certification Duration</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">How long does forklift certification last in different states?</h3>
              <p className="text-slate-600 mt-1">
                While OSHA sets the standard at three years, some states may have additional requirements. However, 
                the three-year duration is the minimum standard across all states. Always check with your local 
                OSHA office for specific requirements.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Can I renew my certification before it expires?</h3>
              <p className="text-slate-600 mt-1">
                Yes, you can renew your certification before the three-year period ends. It's recommended to plan for renewal 
                at least one month before expiration to ensure continuous compliance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">What happens if my certification expires?</h3>
              <p className="text-slate-600 mt-1">
                Operating a forklift with an expired certification is a violation of OSHA regulations. You must complete 
                the full certification process again before resuming operation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Do I need different certifications for different types of forklifts?</h3>
              <p className="text-slate-600 mt-1">
                Yes, operators need specific training and certification for each type of forklift they operate. 
                This ensures proper handling of different equipment characteristics and safety requirements.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">How can I verify my certification status?</h3>
              <p className="text-slate-600 mt-1">
                Keep your certification card and training records in a safe place. You can also contact your employer's 
                safety department or training provider to verify your certification status.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Need Forklift Certification Training?</h3>
          <p className="mb-4">
            Flat Earth Equipment offers comprehensive forklift certification training programs. Our certified instructors 
            provide both classroom and hands-on training to ensure you meet all OSHA requirements.
          </p>
          <Link 
            href="/safety/forklift-certification"
            className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
          >
            Learn More About Our Training Programs
          </Link>
        </div>
      </div>
    </main>
  );
} 