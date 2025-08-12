import { Metadata } from "next";
import { supabaseServer } from "@/lib/supabaseServer";
import BatteryChargerSelector from "./BatteryChargerSelector";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Forklift Battery Charger Selector – Find the Right Charger Fast",
  description: "Easily find the right forklift battery charger by voltage, amps, and phase. Quick ship options available. Add to cart or request a quote today.",
  openGraph: {
    title: "Forklift Battery Charger Selector",
    description: "Find the perfect charger for your forklift battery in 3 simple steps.",
    type: "website",
  },
};

async function fetchAllChargers() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("parts")
    .select(`
      id,
      name,
      slug,
      brand,
      description,
      image_url,
      price,
      price_cents,
      sku,
      category_slug,
      stripe_price_id,
      has_core_charge,
      core_charge
    `)
    .eq("category_slug", "battery-chargers")
    .order("name", { ascending: true })
    .limit(1000);

  if (error) {
    console.error("Error fetching chargers:", error);
    return [];
  }

  return data ?? [];
}

export default async function BatteryChargersPage() {
  const chargers = await fetchAllChargers();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find Your Perfect
              <span className="block text-blue-200">Battery Charger</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Answer 3 simple questions to find the ideal forklift battery charger 
              for your voltage, current, and facility requirements.
            </p>
            <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <div className="flex items-center gap-4 text-sm text-blue-200">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Quick Ship Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Expert Support
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  All Major Brands
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <BatteryChargerSelector chargers={chargers} />
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900">
              Why Choose Our Chargers?
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Professional-grade chargers designed for industrial applications
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Fast Charging</h3>
              <p className="text-neutral-600 text-sm">
                Optimized charging profiles reduce downtime and maximize productivity
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Reliable</h3>
              <p className="text-neutral-600 text-sm">
                Built for 24/7 operation with advanced safety features and monitoring
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Efficient</h3>
              <p className="text-neutral-600 text-sm">
                Energy-efficient designs reduce power consumption and operating costs
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM8.25 12l7.5 0" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Support</h3>
              <p className="text-neutral-600 text-sm">
                Expert technical support and installation assistance available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
