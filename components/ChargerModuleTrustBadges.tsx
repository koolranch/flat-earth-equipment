import { Truck, Shield, Wrench, Phone } from "lucide-react";

export default function ChargerModuleTrustBadges() {
  return (
    <section className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="space-y-2">
          <Truck className="h-8 w-8 text-canyon-rust mx-auto" />
          <h3 className="font-semibold text-sm text-gray-900">Same-Day Dispatch</h3>
          <p className="text-xs text-gray-600">
            Ships today if ordered before 3 PM EST
          </p>
        </div>
        
        <div className="space-y-2">
          <Shield className="h-8 w-8 text-canyon-rust mx-auto" />
          <h3 className="font-semibold text-sm text-gray-900">6-Month Warranty</h3>
          <p className="text-xs text-gray-600">
            Western-tough reliability guarantee
          </p>
        </div>
        
        <div className="space-y-2">
          <Wrench className="h-8 w-8 text-canyon-rust mx-auto" />
          <h3 className="font-semibold text-sm text-gray-900">Expert Rebuilt</h3>
          <p className="text-xs text-gray-600">
            Bench-tested to exceed OEM specs
          </p>
        </div>
        
        <div className="space-y-2">
          <Phone className="h-8 w-8 text-canyon-rust mx-auto" />
          <h3 className="font-semibold text-sm text-gray-900">U.S.-Based Support</h3>
          <p className="text-xs text-gray-600">
            Technical assistance available
          </p>
        </div>
      </div>
    </section>
  );
} 