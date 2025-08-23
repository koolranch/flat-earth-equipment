import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Package, Zap, Clock, CreditCard, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: "Toyota Forklift Year by Serial Number | Flat Earth Equipment",
  description: "Find your Toyota forklift's year of manufacture using our comprehensive serial number guide. Includes model years from 1980 to present.",
  alternates: {
    canonical: "/parts/toyota-forklift-year-by-serial-number",
  },
};

export default function ToyotaForkliftYearGuidePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Toyota Forklift Year by Serial Number Guide
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-6">
          Use this guide to determine your Toyota forklift's year of manufacture based on its serial number. 
          This information is crucial for ordering the correct replacement parts and maintaining your equipment.
        </p>

        {/* Interactive Tool Callout */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">🔧 Try Our Interactive Lookup Tool</h3>
              <p className="text-slate-700 mb-4">
                Get instant year estimation with our new interactive tool - just enter your model and serial number 
                for immediate results with no manual table lookup required!
              </p>
              <Link 
                href="/toyota-forklift-serial-lookup"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                <Zap className="h-4 w-4" />
                Try Interactive Lookup Tool
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">How to Find Your Serial Number</h2>
          <p className="mb-4">
            The serial number on Toyota forklifts is typically located in one of these locations:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>On the frame near the right front wheel</li>
            <li>On the data plate mounted to the overhead guard</li>
            <li>On the frame near the hydraulic tank</li>
          </ul>
          <p>
            The serial number is usually 7-8 digits long and may be preceded by letters indicating the model series.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Serial Number Year Guide</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-3 text-left">Year</th>
                <th className="border p-3 text-left">Serial Number Range</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-3">2023</td>
                <td className="border p-3">7FGCU25-XXXXX</td>
              </tr>
              <tr>
                <td className="border p-3">2022</td>
                <td className="border p-3">7FGCU25-XXXXX</td>
              </tr>
              <tr>
                <td className="border p-3">2021</td>
                <td className="border p-3">7FGCU25-XXXXX</td>
              </tr>
              <tr>
                <td className="border p-3">2020</td>
                <td className="border p-3">7FGCU25-XXXXX</td>
              </tr>
              <tr>
                <td className="border p-3">2019</td>
                <td className="border p-3">7FGCU25-XXXXX</td>
              </tr>
              <tr>
                <td className="border p-3">2018</td>
                <td className="border p-3">7FGCU25-XXXXX</td>
              </tr>
              <tr>
                <td className="border p-3">2017</td>
                <td className="border p-3">7FGCU25-XXXXX</td>
              </tr>
              <tr>
                <td className="border p-3">2016</td>
                <td className="border p-3">7FGCU25-XXXXX</td>
              </tr>
              <tr>
                <td className="border p-3">2015</td>
                <td className="border p-3">7FGCU25-XXXXX</td>
              </tr>
              <tr>
                <td className="border p-3">2014</td>
                <td className="border p-3">7FGCU25-XXXXX</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 my-8">
          <h3 className="text-xl font-semibold text-orange-800 mb-4">🔧 Common Toyota Forklift Replacement Parts</h3>
          <p className="text-orange-700 mb-4">
            Now that you've identified your Toyota forklift's year, you can order the correct replacement parts. Here are some of our most popular Toyota forklift components:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-gray-800 mb-2">
                <Link href="/parts/toyota-seat-assembly-vinyl-53720-u224171" className="text-orange-600 hover:text-orange-700 underline">
                  Vinyl Seat Assembly
                </Link>
              </h4>
              <p className="text-sm text-gray-600 mb-2">Toyota 53720-U2241-71</p>
              <p className="text-orange-600 font-medium">$750.00</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-gray-800 mb-2">
                <Link href="/parts/toyota-seat-assembly-cloth-53730-u116271" className="text-orange-600 hover:text-orange-700 underline">
                  Cloth Seat Assembly
                </Link>
              </h4>
              <p className="text-sm text-gray-600 mb-2">Toyota 53730-U1162-71</p>
              <p className="text-orange-600 font-medium">$850.00</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold text-gray-800 mb-2">
                <Link href="/parts/toyota-seat-assembly-cloth-53730-u117071" className="text-orange-600 hover:text-orange-700 underline">
                  Cloth Seat Assembly
                </Link>
              </h4>
              <p className="text-sm text-gray-600 mb-2">Toyota 53730-U1170-71</p>
              <p className="text-orange-600 font-medium">$520.00</p>
            </div>
          </div>
          <p className="text-orange-700 mt-4 text-sm">
            💡 <strong>Pro Tip:</strong> Worn seats can impact operator comfort and productivity. Consider upgrading to maintain peak performance.
          </p>
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
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Toyota Parts & Maintenance</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <Link href="/parts/toyota-forklift-parts" className="text-blue-600 hover:underline">
                    Toyota Forklift Parts Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/parts/toyota-forklift-manuals" className="text-blue-600 hover:underline">
                    Toyota Forklift Manuals
                  </Link>
                </li>
                <li>
                  <Link href="/parts/toyota-forklift-maintenance" className="text-blue-600 hover:underline">
                    Toyota Forklift Maintenance Guide
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Popular Toyota Replacement Parts</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <Link href="/parts/toyota-seat-assembly-vinyl-53720-u224171" className="text-blue-600 hover:underline">
                    Toyota Vinyl Seat Assemblies
                  </Link>
                </li>
                <li>
                  <Link href="/parts/toyota-seat-assembly-cloth-53730-u116271" className="text-blue-600 hover:underline">
                    Toyota Cloth Seat Assemblies
                  </Link>
                </li>
                <li>
                  <Link href="/brand/toyota" className="text-blue-600 hover:underline">
                    All Toyota Forklift Parts
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 