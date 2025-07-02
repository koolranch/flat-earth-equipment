import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Phone, Mail, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: "JCB Telehandler Fault Codes List | Flat Earth Equipment",
  description: "Complete guide to JCB telehandler fault codes, error messages, and troubleshooting solutions. Find your error code and get back to work quickly.",
  alternates: {
    canonical: "/rental/telehandler/jcb-telehandler-fault-codes-list",
  },
};

export default function JCBTelehandlerFaultCodesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        JCB Telehandler Fault Codes Guide
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          Use this comprehensive guide to identify and troubleshoot JCB telehandler fault codes. 
          Find your error code below to understand what it means and how to resolve it.
        </p>

        <div className="bg-yellow-50 p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Important Safety Notice</h2>
              <p className="mb-4">
                Always follow proper safety procedures when troubleshooting telehandler issues. 
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

        <h2 className="text-2xl font-semibold mb-4">Common JCB Telehandler Fault Codes</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">E001 - Engine Oil Pressure Low</h3>
            <p className="mb-4">The engine oil pressure has fallen below the minimum required level.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Check engine oil level</li>
                <li>Inspect for oil leaks</li>
                <li>Verify oil pressure sensor operation</li>
                <li>Check oil pump function</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">E002 - Engine Coolant Temperature High</h3>
            <p className="mb-4">The engine coolant temperature has exceeded the maximum safe operating limit.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Check coolant level</li>
                <li>Inspect radiator for blockages</li>
                <li>Verify fan operation</li>
                <li>Check thermostat function</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">E003 - Hydraulic System Pressure Low</h3>
            <p className="mb-4">The hydraulic system pressure is below the required operating range.</p>
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

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">E004 - Transmission Error</h3>
            <p className="mb-4">The transmission system has detected an abnormal condition.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Check transmission fluid level</li>
                <li>Inspect transmission filters</li>
                <li>Verify shift solenoids</li>
                <li>Check transmission sensors</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">E005 - Load Sensing System Error</h3>
            <p className="mb-4">The load sensing system has detected an abnormal condition.</p>
            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Possible Solutions:</h4>
              <ul className="list-disc pl-6">
                <li>Check load sensor connections</li>
                <li>Verify load sensor calibration</li>
                <li>Inspect wiring harness</li>
                <li>Check control unit operation</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Need JCB Replacement Parts?</h2>
          <p className="mb-4">
            Our parts specialists can help you find the right JCB telehandler parts based on your fault code diagnosis. 
            Contact us for parts inquiries and availability:
          </p>
          <ul className="list-none space-y-2">
            <li className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              <span>(307) 302-0043</span>
            </li>
            <li className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              <span>parts@flatearthequipment.com</span>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
          <ul className="list-disc pl-6">
            <li>
              <Link href="/parts/jcb-telehandler-parts" className="text-blue-600 hover:underline">
                JCB Telehandler Parts Catalog
              </Link>
            </li>
            <li>
              <Link href="/rental/telehandler/jcb" className="text-blue-600 hover:underline">
                JCB Telehandler Rentals
              </Link>
            </li>
            <li>
              <Link href="/service/telehandler-maintenance" className="text-blue-600 hover:underline">
                Telehandler Maintenance Services
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
} 