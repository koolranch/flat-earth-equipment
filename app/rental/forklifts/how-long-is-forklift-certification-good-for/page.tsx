import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: "How Long Does OSHA Certification Last? | Forklift Training Guide 2024",
  description: "How long does OSHA certification last? OSHA forklift certification is valid for 3 years. Complete guide to OSHA certification duration, renewal requirements, and training.",
  alternates: {
    canonical: "/rental/forklifts/how-long-is-forklift-certification-good-for",
  },
  openGraph: {
    title: "How Long Does OSHA Certification Last? | Forklift Training Guide 2024",
    description: "How long does OSHA certification last? OSHA forklift certification is valid for 3 years. Complete guide to OSHA certification duration, renewal requirements, and training.",
    url: "https://www.flatearthequipment.com/rental/forklifts/how-long-is-forklift-certification-good-for",
    type: "article",
  },
};

export default function ForkliftCertificationDurationPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        How Long Does OSHA Certification Last? (2024 Guide)
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          How long does OSHA certification last? According to OSHA standards (CFR 1910.178), OSHA forklift certification 
          is valid for three years from the date of training. This comprehensive guide explains everything you need 
          to know about OSHA certification duration, renewal requirements, and maintaining compliance. Need to get certified? 
          <Link href="/safety" className="text-blue-600 hover:underline font-semibold">Get your OSHA certification online for $59</Link>.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">How Long Does OSHA Certification Last? Official Requirements</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Clock className="w-6 h-6 text-canyon-rust" />
              </div>
              <div>
                <h3 className="font-semibold">OSHA Certification Duration</h3>
                <p className="mt-2">
                  How long does OSHA certification last? <Link href="/safety" className="text-blue-600 hover:underline">OSHA requires forklift operator certifications</Link> to be valid 
                  for three years from the date of training under CFR 1910.178(l)(4)(ii). However, there are several circumstances that may require 
                  earlier OSHA recertification.
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
          <h3 className="text-xl font-semibold mb-4 text-yellow-800">Important OSHA Safety Reminder</h3>
          <p className="text-yellow-700">
            While OSHA certification is valid for three years, operators should continuously practice safe operation 
            and stay updated on OSHA safety protocols. Regular training and evaluation are essential for maintaining 
            OSHA compliance and a safe workplace.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              href="/safety"
              className="block p-6 border rounded-lg hover:border-canyon-rust transition"
            >
              <h3 className="text-lg font-semibold mb-2">Online Forklift Certification ($59)</h3>
              <p className="text-slate-600">
                Complete your OSHA-compliant forklift certification online in under 60 minutes. Instant certificate download.
              </p>
            </Link>
            <Link 
              href="/safety"
              className="block p-6 border rounded-lg hover:border-canyon-rust transition"
            >
              <h3 className="text-lg font-semibold mb-2">Forklift Training Course</h3>
              <p className="text-slate-600">
                8 interactive video lessons with real-world hazard recognition demos and mobile-friendly evaluation.
              </p>
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-slate-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions About Forklift Certification Duration</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">How long does OSHA certification last for forklift operators?</h3>
              <p className="text-slate-600 mt-1">
                OSHA certification for forklift operators lasts exactly 3 years from the date of training completion. 
                This is mandated by OSHA regulation CFR 1910.178(l)(4)(ii) and applies nationwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">How long does OSHA forklift certification last in different states?</h3>
              <p className="text-slate-600 mt-1">
                While OSHA sets the federal standard at three years, some states may have additional requirements. However, 
                the three-year OSHA certification duration is the minimum standard across all states. Always check with your local 
                OSHA office for specific requirements.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Can I renew my OSHA certification before it expires?</h3>
              <p className="text-slate-600 mt-1">
                Yes, you can renew your OSHA certification before the three-year period ends. It's recommended to plan for OSHA renewal 
                at least one month before expiration to ensure continuous compliance with OSHA standards.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">What happens if my OSHA certification expires?</h3>
              <p className="text-slate-600 mt-1">
                Operating a forklift with an expired OSHA certification is a violation of OSHA regulations. You must <Link href="/safety" className="text-blue-600 hover:underline">complete 
                the full OSHA certification process</Link> again before resuming operation.
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
          <h3 className="text-xl font-semibold mb-4">Need OSHA Certification Training?</h3>
          <p className="mb-4">
            Get your OSHA-compliant forklift certification online for just $59. Complete in under 60 minutes at your own pace with instant certificate download. 
            Over 10,000 operators OSHA certified nationwide.
          </p>
          <Link 
            href="/safety"
            className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
          >
            Get Certified for $59
          </Link>
        </div>
      </div>
    </main>
  );
} 