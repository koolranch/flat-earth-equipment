import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: "Hyster Forklift Fault Codes List | Flat Earth Equipment",
  description: "Comprehensive guide to Hyster forklift fault codes, error messages, and troubleshooting solutions. Find your error code and get back to work quickly.",
  alternates: {
    canonical: "/rental/forklifts/hyster-forklift-fault-codes-list",
  },
};

export default function HysterForkliftFaultCodesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Hyster Forklift Fault Codes List
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          Use this comprehensive guide to identify and troubleshoot Hyster forklift fault codes. 
          Find your error code below to understand what it means and how to resolve it.
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

        <h2 className="text-2xl font-semibold mb-4">Common Hyster Fault Codes</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">E001 - Battery Voltage Low</h3>
            <p className="mb-4">The battery voltage is below the minimum required level.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Charge the battery</li>
                <li>Check battery connections</li>
                <li>Test battery voltage</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">E002 - Motor Overcurrent</h3>
            <p className="mb-4">The motor is drawing more current than the system allows.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Check for mechanical binding</li>
                <li>Inspect motor brushes</li>
                <li>Verify motor controller settings</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">E003 - Controller Temperature High</h3>
            <p className="mb-4">The controller temperature has exceeded the maximum limit.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Allow the controller to cool down</li>
                <li>Check cooling fan operation</li>
                <li>Clean air filters and vents</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">E004 - Accelerator Error</h3>
            <p className="mb-4">The accelerator pedal is not functioning correctly.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Check accelerator pedal connections</li>
                <li>Inspect pedal potentiometer</li>
                <li>Verify controller input signals</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Need Professional Help?</h2>
          <p className="mb-4">
            Our certified technicians are available to help diagnose and repair your Hyster forklift. 
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
              <Link href="/parts/hyster-forklift-parts" className="text-blue-600 hover:underline">
                Hyster Forklift Parts Catalog
              </Link>
            </li>
            <li>
              <Link href="/rental/forklifts/hyster" className="text-blue-600 hover:underline">
                Hyster Forklift Rentals
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
  );
} 