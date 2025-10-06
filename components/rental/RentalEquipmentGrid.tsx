'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type RentalEquipment = {
  seo_slug: string;
  category: string;
  brand: string;
  model: string;
  name?: string;
  lift_height_ft?: number;
  weight_capacity_lbs?: number;
  power_source?: string;
  image_url?: string;
};

type Props = {
  rentals: RentalEquipment[];
  categorySlug: string;
};

export default function RentalEquipmentGrid({ rentals, categorySlug }: Props) {
  const [brandFilter, setBrandFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [heightFilter, setHeightFilter] = useState('');
  const [powerFilter, setPowerFilter] = useState('');

  // Filter equipment based on selected filters
  const filteredRentals = useMemo(() => {
    return rentals.filter(rental => {
      // Brand filter
      if (brandFilter && rental.brand !== brandFilter) return false;
      
      // Capacity filter
      if (capacityFilter && rental.weight_capacity_lbs) {
        if (rental.weight_capacity_lbs < parseInt(capacityFilter)) return false;
      }
      
      // Height filter
      if (heightFilter && rental.lift_height_ft) {
        if (rental.lift_height_ft < parseInt(heightFilter)) return false;
      }
      
      // Power source filter
      if (powerFilter && rental.power_source !== powerFilter) return false;
      
      return true;
    });
  }, [rentals, brandFilter, capacityFilter, heightFilter, powerFilter]);

  // Get unique values for filters
  const brands = Array.from(new Set(rentals.map(r => r.brand))).sort();
  const powerSources = Array.from(new Set(rentals.map(r => r.power_source).filter(Boolean))).sort();
  const hasCapacity = rentals.some(r => r.weight_capacity_lbs);
  const hasHeight = rentals.some(r => r.lift_height_ft);

  return (
    <>
      {/* Count */}
      <div className="mb-8">
        <p className="text-slate-600">
          Showing {filteredRentals.length} of {rentals.length} {rentals.length === 1 ? 'model' : 'models'}
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Filter Equipment</h2>
          {(brandFilter || capacityFilter || heightFilter || powerFilter) && (
            <button
              onClick={() => {
                setBrandFilter('');
                setCapacityFilter('');
                setHeightFilter('');
                setPowerFilter('');
              }}
              className="text-sm text-canyon-rust hover:underline font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Brand</label>
            <select 
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          
          {/* Capacity Filter */}
          {hasCapacity && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Capacity</label>
              <select 
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
              >
                <option value="">Any Capacity</option>
                <option value="1000">1,000+ lbs</option>
                <option value="3000">3,000+ lbs</option>
                <option value="5000">5,000+ lbs</option>
                <option value="8000">8,000+ lbs</option>
              </select>
            </div>
          )}
          
          {/* Lift Height Filter */}
          {hasHeight && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Lift Height</label>
              <select 
                value={heightFilter}
                onChange={(e) => setHeightFilter(e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
              >
                <option value="">Any Height</option>
                <option value="20">20+ ft</option>
                <option value="30">30+ ft</option>
                <option value="40">40+ ft</option>
                <option value="60">60+ ft</option>
              </select>
            </div>
          )}
          
          {/* Power Source Filter */}
          {powerSources.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Power Source</label>
              <select 
                value={powerFilter}
                onChange={(e) => setPowerFilter(e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
              >
                <option value="">All Power Types</option>
                {powerSources.map(power => (
                  <option key={power} value={power}>{power?.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredRentals.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <p className="text-lg text-slate-600 mb-4">No equipment matches your filters</p>
          <button
            onClick={() => {
              setBrandFilter('');
              setCapacityFilter('');
              setHeightFilter('');
              setPowerFilter('');
            }}
            className="text-canyon-rust hover:underline font-medium"
          >
            Clear filters to see all equipment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((rental) => (
            <Link
              key={rental.seo_slug}
              href={`/rentals/${categorySlug}/${rental.seo_slug}`}
              className="group block rounded-xl border-2 border-slate-200 bg-white hover:border-canyon-rust hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Image Section */}
              <div className="relative bg-slate-50 h-48 flex items-center justify-center p-4">
                {rental.image_url ? (
                  <img
                    src={rental.image_url}
                    alt={rental.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-6xl text-slate-300">
                    {rental.category.toLowerCase().includes('boom') ? '🏗️' : 
                     rental.category.toLowerCase().includes('scissor') ? '✂️' :
                     rental.category.toLowerCase().includes('forklift') ? '🏭' :
                     rental.category.toLowerCase().includes('telehandler') ? '🚜' :
                     rental.category.toLowerCase().includes('skid') ? '🚧' : '🏗️'}
                  </div>
                )}
                {/* Brand Badge */}
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                  {rental.brand}
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-canyon-rust transition-colors">
                    {rental.model || rental.name}
                  </h2>
                  <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">
                    {rental.brand}
                  </p>
                </div>
                
                {/* Specifications */}
                <div className="space-y-2">
                  {rental.weight_capacity_lbs && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-canyon-rust flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      <span className="text-slate-700">
                        <span className="font-semibold">Capacity:</span> {rental.weight_capacity_lbs.toLocaleString()} lbs
                      </span>
                    </div>
                  )}
                  {rental.lift_height_ft && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-canyon-rust flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span className="text-slate-700">
                        <span className="font-semibold">Lift Height:</span> {rental.lift_height_ft} ft
                      </span>
                    </div>
                  )}
                  {rental.power_source && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-canyon-rust flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-slate-700">
                        <span className="font-semibold">Power:</span> {rental.power_source.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* CTA */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-canyon-rust group-hover:gap-3 transition-all">
                    View Details & Request Quote
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
