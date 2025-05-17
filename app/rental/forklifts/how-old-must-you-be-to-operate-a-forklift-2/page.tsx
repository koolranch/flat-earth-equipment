import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Phone, Mail, Search, UserCheck, Shield, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: "Forklift Operator Age Requirements | Flat Earth Equipment",
  description: "Learn about the legal age requirements and certification needed to operate a forklift. Complete guide to forklift operator qualifications.",
  alternates: {
    canonical: "/rental/forklifts/how-old-must-you-be-to-operate-a-forklift-2",
  },
};

export default function ForkliftOperatorAgeRequirementsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Forklift Operator Age Requirements Guide
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          Understanding the age requirements and qualifications for operating a forklift is crucial for both employers and potential operators. 
          This guide outlines the legal requirements and necessary certifications.
        </p>

        <div className="bg-yellow-50 p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Important Legal Notice</h2>
              <p className="mb-4">
                Forklift operation is regulated by OSHA and state laws. Always ensure compliance with all applicable regulations 
                and maintain proper documentation of operator certifications.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Age Requirements</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Federal Requirements</h3>
                <ul className="list-disc pl-6">
                  <li>Minimum age: 18 years old</li>
                  <li>OSHA certification required</li>
                  <li>Valid driver's license (in most states)</li>
                  <li>No specific maximum age limit</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">State-Specific Requirements</h3>
                <ul className="list-disc pl-6">
                  <li>Some states may have additional requirements</li>
                  <li>Check local regulations for specific rules</li>
                  <li>State-specific certification may be required</li>
                  <li>Additional training requirements may apply</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Certification Requirements</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Required Training</h3>
                <ul className="list-disc pl-6">
                  <li>Formal instruction</li>
                  <li>Practical training</li>
                  <li>Evaluation of operator performance</li>
                  <li>Refresher training as needed</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Documentation</h3>
                <ul className="list-disc pl-6">
                  <li>Certification records</li>
                  <li>Training documentation</li>
                  <li>Performance evaluations</li>
                  <li>Refresher training records</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Physical Requirements</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Health and Safety</h3>
                <ul className="list-disc pl-6">
                  <li>Good vision and hearing</li>
                  <li>Physical ability to operate controls</li>
                  <li>Ability to maintain balance</li>
                  <li>No medical conditions that could affect operation</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Safety Considerations</h3>
                <ul className="list-disc pl-6">
                  <li>Proper safety equipment</li>
                  <li>Understanding of safety procedures</li>
                  <li>Knowledge of emergency protocols</li>
                  <li>Regular health assessments</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Need Training or Certification?</h2>
          <p className="mb-4">
            Our certified instructors can provide forklift operator training and certification. 
            Contact us for more information:
          </p>
          <ul className="list-none space-y-2">
            <li className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              <span>1-800-XXX-XXXX</span>
            </li>
            <li className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              <span>training@flatearthequipment.com</span>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
          <ul className="list-disc pl-6">
            <li>
              <Link href="/rental/forklifts" className="text-blue-600 hover:underline">
                Forklift Rentals
              </Link>
            </li>
            <li>
              <Link href="/service/forklift-training" className="text-blue-600 hover:underline">
                Forklift Training Services
              </Link>
            </li>
            <li>
              <Link href="/parts/forklift-parts" className="text-blue-600 hover:underline">
                Forklift Parts
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
} 