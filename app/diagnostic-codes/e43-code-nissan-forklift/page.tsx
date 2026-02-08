import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Phone, Mail, Search } from 'lucide-react';
import { generatePageAlternates } from "@/app/seo-defaults";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Nissan Forklift E43 Error Code Guide | Flat Earth Equipment",
  description: "Learn how to diagnose and fix the E43 error code on your Nissan forklift. Complete troubleshooting guide with step-by-step solutions.",
  alternates: generatePageAlternates("/diagnostic-codes/e43-code-nissan-forklift"),
};

export default function NissanForkliftE43CodePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.flatearthequipment.com' },
          { name: 'Diagnostic Codes', url: 'https://www.flatearthequipment.com/diagnostic-codes' },
          { name: 'Nissan E43 Error Code', url: 'https://www.flatearthequipment.com/diagnostic-codes/e43-code-nissan-forklift' },
        ]}
      />
      <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Nissan Forklift E43 Error Code Guide
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          The E43 error code on Nissan forklifts indicates a problem with the accelerator pedal position sensor. 
          This guide will help you understand the issue and provide solutions to resolve it.
        </p>

        <div className="bg-yellow-50 p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Important Safety Notice</h2>
              <p className="mb-4">
                Always follow proper safety procedures when troubleshooting forklift issues. 
                If you're unsure about any repair, contact a certified technician.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What is the E43 Error Code?</h2>
            <p className="mb-4">
              The E43 error code indicates that the accelerator pedal position sensor is not functioning correctly. 
              This sensor is crucial for controlling the forklift's speed and acceleration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Common Symptoms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Forklift fails to accelerate properly</li>
              <li>Erratic speed control</li>
              <li>Forklift may not move at all</li>
              <li>Warning light illuminated on the dashboard</li>
              <li>Error code E43 displayed on the control panel</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Troubleshooting Steps</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Step 1: Check Accelerator Pedal</h3>
                <ul className="list-disc pl-6">
                  <li>Inspect the accelerator pedal for physical damage</li>
                  <li>Verify the pedal moves smoothly</li>
                  <li>Check for any obstructions</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Step 2: Inspect Wiring</h3>
                <ul className="list-disc pl-6">
                  <li>Check for loose or damaged wiring connections</li>
                  <li>Inspect for any frayed or broken wires</li>
                  <li>Verify ground connections are secure</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Step 3: Test Sensor</h3>
                <ul className="list-disc pl-6">
                  <li>Use a multimeter to test sensor resistance</li>
                  <li>Verify voltage output at different pedal positions</li>
                  <li>Check for proper signal to the controller</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Solutions</h2>
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Common Fixes:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Clean and adjust the accelerator pedal mechanism</li>
                <li>Replace damaged or worn wiring</li>
                <li>Install a new accelerator position sensor</li>
                <li>Reset the controller after repairs</li>
                <li>Update controller software if available</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Need Professional Help?</h2>
          <p className="mb-4">
            Our certified Nissan technicians are available to help diagnose and repair your forklift. 
            Contact us for immediate assistance:
          </p>
          <ul className="list-none space-y-2">
            <li className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              <span>1-800-XXX-XXXX</span>
            </li>
            <li className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              <span>service@flatearthequipment.com</span>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
          <ul className="list-disc pl-6">
            <li>
              <Link href="/parts/nissan-forklift-parts" className="text-blue-600 hover:underline">
                Nissan Forklift Parts Catalog
              </Link>
            </li>
            <li>
              <Link href="/rental/forklifts/nissan" className="text-blue-600 hover:underline">
                Nissan Forklift Rentals
              </Link>
            </li>
            <li>
              <Link href="/service/forklift-maintenance" className="text-blue-600 hover:underline">
                Forklift Maintenance Services
              </Link>
            </li>
          </ul>
        </div>
      </div>
      </main>
    </>
  );
} 