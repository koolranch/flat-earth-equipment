import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Phone, Mail, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: "Case Loader Serial Number Lookup | Flat Earth Equipment",
  description: "Find your Case loader's year of manufacture using our comprehensive serial number guide. Includes model years from 1980 to present.",
  alternates: {
    canonical: "/parts/construction-equipment-parts/case-loader-serial-number-lookup",
  },
};

export default function CaseLoaderSerialNumberPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Case Loader Serial Number Lookup Guide
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          Use this guide to determine your Case loader's year of manufacture based on its serial number. 
          This information is crucial for ordering the correct replacement parts and maintaining your equipment.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">How to Find Your Serial Number</h2>
          <p className="mb-4">
            The serial number on Case loaders is typically located in one of these locations:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>On the frame near the right front wheel</li>
            <li>On the data plate mounted to the overhead guard</li>
            <li>On the frame near the hydraulic tank</li>
            <li>On the engine block (for engine serial number)</li>
          </ul>
          <p>
            The serial number is usually 8-10 digits long and may be preceded by letters indicating the model series.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Serial Number Year Guide</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-3 text-left">Year</th>
                <th className="border p-3 text-left">Serial Number Range</th>
                <th className="border p-3 text-left">Model Series</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-3">2023</td>
                <td className="border p-3">JAF0000001+</td>
                <td className="border p-3">SV Series</td>
              </tr>
              <tr>
                <td className="border p-3">2022</td>
                <td className="border p-3">JAF0000001+</td>
                <td className="border p-3">SV Series</td>
              </tr>
              <tr>
                <td className="border p-3">2021</td>
                <td className="border p-3">JAF0000001+</td>
                <td className="border p-3">SV Series</td>
              </tr>
              <tr>
                <td className="border p-3">2020</td>
                <td className="border p-3">JAF0000001+</td>
                <td className="border p-3">SV Series</td>
              </tr>
              <tr>
                <td className="border p-3">2019</td>
                <td className="border p-3">JAF0000001+</td>
                <td className="border p-3">SV Series</td>
              </tr>
              <tr>
                <td className="border p-3">2018</td>
                <td className="border p-3">JAF0000001+</td>
                <td className="border p-3">SV Series</td>
              </tr>
              <tr>
                <td className="border p-3">2017</td>
                <td className="border p-3">JAF0000001+</td>
                <td className="border p-3">SV Series</td>
              </tr>
              <tr>
                <td className="border p-3">2016</td>
                <td className="border p-3">JAF0000001+</td>
                <td className="border p-3">SV Series</td>
              </tr>
              <tr>
                <td className="border p-3">2015</td>
                <td className="border p-3">JAF0000001+</td>
                <td className="border p-3">SV Series</td>
              </tr>
              <tr>
                <td className="border p-3">2014</td>
                <td className="border p-3">JAF0000001+</td>
                <td className="border p-3">SV Series</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Need Help Finding Your Serial Number?</h2>
          <p className="mb-4">
            Our parts specialists are available to help you locate your serial number and determine the correct year of manufacture. 
            Contact us for assistance:
          </p>
          <ul className="list-none space-y-2">
            <li className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              <span>1-800-XXX-XXXX</span>
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
              <Link href="/parts/construction-equipment-parts/case" className="text-blue-600 hover:underline">
                Case Loader Parts Catalog
              </Link>
            </li>
            <li>
              <Link href="/rental/construction-equipment/case" className="text-blue-600 hover:underline">
                Case Loader Rentals
              </Link>
            </li>
            <li>
              <Link href="/service/construction-equipment-maintenance" className="text-blue-600 hover:underline">
                Construction Equipment Maintenance Services
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
} 