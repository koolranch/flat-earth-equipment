import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Phone, Mail, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: "Cat Forklift Fault Codes | Flat Earth Equipment",
  description: "Complete guide to Cat forklift fault codes, error messages, and troubleshooting solutions. Find your error code and get back to work quickly.",
  alternates: {
    canonical: "/diagnostic-codes/cat-forklift-fault-codes",
  },
};

export default function CatForkliftFaultCodesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Cat Forklift Fault Codes Guide
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          Use this comprehensive guide to identify and troubleshoot Cat forklift fault codes. 
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

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search fault codes..."
              className="w-full p-3 pl-10 border rounded-lg"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Common Cat Forklift Fault Codes</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">F01 - Battery Voltage Low</h3>
            <p className="mb-4">The battery voltage is below the minimum required level for operation.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Charge the battery immediately</li>
                <li>Check battery connections for corrosion</li>
                <li>Test battery voltage with a multimeter</li>
                <li>Inspect battery cables for damage</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">F02 - Motor Overcurrent</h3>
            <p className="mb-4">The motor is drawing more current than the system allows, indicating a potential overload condition.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Check for mechanical binding in the drive system</li>
                <li>Inspect motor brushes and commutator</li>
                <li>Verify motor controller settings</li>
                <li>Check for excessive load on the forklift</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">F03 - Controller Temperature High</h3>
            <p className="mb-4">The controller temperature has exceeded the maximum safe operating limit.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Allow the controller to cool down</li>
                <li>Check cooling fan operation</li>
                <li>Clean air filters and vents</li>
                <li>Verify ambient temperature is within operating range</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">F04 - Accelerator Error</h3>
            <p className="mb-4">The accelerator pedal is not functioning correctly or sending invalid signals.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Check accelerator pedal connections</li>
                <li>Inspect pedal potentiometer</li>
                <li>Verify controller input signals</li>
                <li>Check for damaged wiring</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">F05 - Hydraulic System Error</h3>
            <p className="mb-4">The hydraulic system is experiencing abnormal pressure or flow conditions.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Check hydraulic fluid level</li>
                <li>Inspect for hydraulic leaks</li>
                <li>Verify pump operation</li>
                <li>Check pressure relief valve</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Need Professional Help?</h2>
          <p className="mb-4">
            Our certified Cat technicians are available to help diagnose and repair your forklift. 
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
              <Link href="/parts/cat-forklift-parts" className="text-blue-600 hover:underline">
                Cat Forklift Parts Catalog
              </Link>
            </li>
            <li>
              <Link href="/rental/forklifts/cat" className="text-blue-600 hover:underline">
                Cat Forklift Rentals
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