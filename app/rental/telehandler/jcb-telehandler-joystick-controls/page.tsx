import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Phone, Mail, Search, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: "JCB Telehandler Joystick Controls Guide | Flat Earth Equipment",
  description: "Learn how to operate JCB telehandler joystick controls. Complete guide to boom, steering, and auxiliary functions.",
  alternates: {
    canonical: "/rental/telehandler/jcb-telehandler-joystick-controls",
  },
};

export default function JcbTelehandlerJoystickControlsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        JCB Telehandler Joystick Controls Guide
      </h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-8">
          This guide provides detailed information about operating the joystick controls on JCB telehandlers. 
          Understanding these controls is essential for safe and efficient operation of the equipment.
        </p>

        <div className="bg-yellow-50 p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Important Safety Notice</h2>
              <p className="mb-4">
                Always familiarize yourself with the controls before operating the telehandler. 
                Ensure you have received proper training and certification before using the equipment.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Main Joystick Controls</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Boom Functions</h3>
                <ul className="list-disc pl-6">
                  <li>Forward: Extends the boom</li>
                  <li>Backward: Retracts the boom</li>
                  <li>Left: Raises the boom</li>
                  <li>Right: Lowers the boom</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Steering Functions</h3>
                <ul className="list-disc pl-6">
                  <li>Left: Steers left</li>
                  <li>Right: Steers right</li>
                  <li>Forward: Accelerates</li>
                  <li>Backward: Brakes/Reverses</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Auxiliary Controls</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Attachment Controls</h3>
                <ul className="list-disc pl-6">
                  <li>Left Trigger: Opens attachment</li>
                  <li>Right Trigger: Closes attachment</li>
                  <li>Top Button: Auxiliary function 1</li>
                  <li>Bottom Button: Auxiliary function 2</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Mode Selection</h3>
                <ul className="list-disc pl-6">
                  <li>Mode 1: Standard operation</li>
                  <li>Mode 2: Fine control mode</li>
                  <li>Mode 3: High-speed mode</li>
                  <li>Mode 4: Attachment-specific mode</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Operating Tips</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
                <ul className="list-disc pl-6">
                  <li>Always start with the boom fully retracted</li>
                  <li>Use smooth, controlled movements</li>
                  <li>Keep both hands on the controls</li>
                  <li>Be aware of load capacity and stability</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Safety Precautions</h3>
                <ul className="list-disc pl-6">
                  <li>Never exceed rated capacity</li>
                  <li>Maintain proper load balance</li>
                  <li>Watch for overhead obstacles</li>
                  <li>Keep clear of power lines</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Need Training or Support?</h2>
          <p className="mb-4">
            Our certified JCB technicians are available to provide training and support for telehandler operation. 
            Contact us for assistance:
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
              <Link href="/rental/telehandler/jcb" className="text-blue-600 hover:underline">
                JCB Telehandler Rentals
              </Link>
            </li>
            <li>
              <Link href="/parts/telehandler-parts/jcb" className="text-blue-600 hover:underline">
                JCB Telehandler Parts
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