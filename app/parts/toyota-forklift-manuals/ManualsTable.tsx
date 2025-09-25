'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';

export interface ManualData {
  model: string;
  series: string;
  fuel: 'Electric' | 'LPG' | 'Gas' | 'Diesel';
  capacity_lb: number;
  manual_type: 'Operator' | 'Parts' | 'Service';
  file_url?: string;
  notes?: string;
}

interface ManualsTableProps {
  data?: ManualData[];
}

// Placeholder data for development
const placeholderData: ManualData[] = [
  {
    model: '8FGCU25',
    series: '8FG',
    fuel: 'LPG',
    capacity_lb: 5000,
    manual_type: 'Operator',
    file_url: '/manuals/toyota/8fgcu25-operator.pdf',
    notes: 'Cushion tire'
  },
  {
    model: '7FBEU18',
    series: '7FBE', 
    fuel: 'Electric',
    capacity_lb: 3500,
    manual_type: 'Parts',
    file_url: '/manuals/toyota/7fbeu18-parts.pdf',
    notes: '24V AC'
  },
  {
    model: '02-8FDF25',
    series: '8FDF',
    fuel: 'Diesel',
    capacity_lb: 5000,
    manual_type: 'Service',
    file_url: '/manuals/toyota/02-8fdf25-service.pdf',
    notes: 'PDF scan'
  },
  {
    model: '5FBE15',
    series: '5FBE',
    fuel: 'Electric',
    capacity_lb: 3000,
    manual_type: 'Operator',
    file_url: '/manuals/toyota/5fbe15-operator.pdf',
    notes: '—'
  },
  {
    model: '8FGU30',
    series: '8FG',
    fuel: 'LPG',
    capacity_lb: 6000,
    manual_type: 'Parts',
    file_url: '/manuals/toyota/8fgu30-parts.pdf',
    notes: 'Pneumatic tire'
  },
  {
    model: '7FGCU20',
    series: '7FG',
    fuel: 'LPG',
    capacity_lb: 4000,
    manual_type: 'Service',
    notes: 'Service manual available'
  },
  {
    model: '6FBEU15',
    series: '6FBE',
    fuel: 'Electric',
    capacity_lb: 3000,
    manual_type: 'Operator',
    file_url: '/manuals/toyota/6fbeu15-operator.pdf',
    notes: '36V'
  },
  {
    model: '8FGCU18',
    series: '8FG',
    fuel: 'LPG',
    capacity_lb: 3500,
    manual_type: 'Parts',
    notes: 'Parts manual in progress'
  },
  {
    model: '7FBCHU25',
    series: '7FBC',
    fuel: 'Electric',
    capacity_lb: 5000,
    manual_type: 'Operator',
    file_url: '/manuals/toyota/7fbchu25-operator.pdf',
    notes: 'Reach truck'
  },
  {
    model: '02-8FGF15',
    series: '8FGF',
    fuel: 'Gas',
    capacity_lb: 3000,
    manual_type: 'Service',
    file_url: '/manuals/toyota/02-8fgf15-service.pdf',
    notes: 'Gasoline engine'
  },
  {
    model: '8FBMT20',
    series: '8FBM',
    fuel: 'Electric',
    capacity_lb: 4000,
    manual_type: 'Parts',
    file_url: '/manuals/toyota/8fbmt20-parts.pdf',
    notes: 'Walkie stacker'
  },
  {
    model: '7FGCU25',
    series: '7FG',
    fuel: 'LPG',
    capacity_lb: 5000,
    manual_type: 'Operator',
    file_url: '/manuals/toyota/7fgcu25-operator.pdf',
    notes: 'Popular model'
  },
  {
    model: '5FBCU25',
    series: '5FBC',
    fuel: 'Electric',
    capacity_lb: 5000,
    manual_type: 'Service',
    notes: 'Service manual needed'
  },
  {
    model: '8FDF25',
    series: '8FDF',
    fuel: 'Diesel',
    capacity_lb: 5000,
    manual_type: 'Operator',
    file_url: '/manuals/toyota/8fdf25-operator.pdf',
    notes: 'Diesel engine'
  },
  {
    model: '6FGU15',
    series: '6FG',
    fuel: 'LPG',
    capacity_lb: 3000,
    manual_type: 'Parts',
    file_url: '/manuals/toyota/6fgu15-parts.pdf',
    notes: 'Older series'
  }
];

export default function ManualsTable({ data }: ManualsTableProps) {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [manualType, setManualType] = useState<'All' | 'Operator' | 'Parts' | 'Service'>('All');
  const [fuel, setFuel] = useState<'All' | 'Electric' | 'LPG' | 'Gas' | 'Diesel'>('All');
  const [capacityMin, setCapacityMin] = useState('');
  const [capacityMax, setCapacityMax] = useState('');

  const manuals = data || placeholderData;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Custom debounce function
  const debouncedSearch = useCallback((value: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedKeyword(value);
    }, 250);
  }, []);

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    debouncedSearch(value);
  };

  // Filter logic
  const filteredManuals = useMemo(() => {
    return manuals.filter(manual => {
      // Keyword search (model, series, notes)
      if (debouncedKeyword) {
        const searchTerm = debouncedKeyword.toLowerCase();
        const searchable = `${manual.model} ${manual.series} ${manual.notes || ''}`.toLowerCase();
        if (!searchable.includes(searchTerm)) {
          return false;
        }
      }

      // Manual type filter
      if (manualType !== 'All' && manual.manual_type !== manualType) {
        return false;
      }

      // Fuel type filter
      if (fuel !== 'All' && manual.fuel !== fuel) {
        return false;
      }

      // Capacity range filter
      if (capacityMin && manual.capacity_lb < parseInt(capacityMin)) {
        return false;
      }
      if (capacityMax && manual.capacity_lb > parseInt(capacityMax)) {
        return false;
      }

      return true;
    });
  }, [manuals, debouncedKeyword, manualType, fuel, capacityMin, capacityMax]);

  const handleReset = () => {
    setKeyword('');
    setDebouncedKeyword('');
    setManualType('All');
    setFuel('All');
    setCapacityMin('');
    setCapacityMax('');
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Filter Manuals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Keyword Search */}
          <div>
            <label htmlFor="keyword-search" className="block text-sm font-medium text-slate-700 mb-1">
              Search
            </label>
            <input
              id="keyword-search"
              type="text"
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              placeholder="Model, series, notes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Manual Type */}
          <div>
            <label htmlFor="manual-type" className="block text-sm font-medium text-slate-700 mb-1">
              Manual Type
            </label>
            <select
              id="manual-type"
              value={manualType}
              onChange={(e) => setManualType(e.target.value as typeof manualType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="All">All</option>
              <option value="Operator">Operator</option>
              <option value="Parts">Parts</option>
              <option value="Service">Service</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label htmlFor="fuel-type" className="block text-sm font-medium text-slate-700 mb-1">
              Fuel Type
            </label>
            <select
              id="fuel-type"
              value={fuel}
              onChange={(e) => setFuel(e.target.value as typeof fuel)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="All">All</option>
              <option value="Electric">Electric</option>
              <option value="LPG">LPG</option>
              <option value="Gas">Gas</option>
              <option value="Diesel">Diesel</option>
            </select>
          </div>

          {/* Capacity Range */}
          <div className="md:col-span-1 lg:col-span-1 xl:col-span-1">
            <label htmlFor="capacity-min" className="block text-sm font-medium text-slate-700 mb-1">
              Capacity Min (lbs)
            </label>
            <input
              id="capacity-min"
              type="number"
              value={capacityMin}
              onChange={(e) => setCapacityMin(e.target.value)}
              placeholder="Min"
              min="0"
              step="500"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-1 lg:col-span-1 xl:col-span-1">
            <label htmlFor="capacity-max" className="block text-sm font-medium text-slate-700 mb-1">
              Capacity Max (lbs)
            </label>
            <div className="flex gap-2">
              <input
                id="capacity-max"
                type="number"
                value={capacityMax}
                onChange={(e) => setCapacityMax(e.target.value)}
                placeholder="Max"
                min="0"
                step="500"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button
                onClick={handleReset}
                aria-label="Reset all filters"
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-600">
        Showing {filteredManuals.length} of {manuals.length}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
        <table className="w-full">
          <caption className="sr-only">
            Toyota forklift manuals with model, series, fuel type, capacity, manual type, and download links
          </caption>
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Series
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Fuel
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Capacity (lb)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Manual Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                File (PDF)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredManuals.map((manual, index) => (
              <tr key={`${manual.model}-${manual.manual_type}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {manual.model}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {manual.series}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {manual.fuel}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {manual.capacity_lb.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {manual.manual_type}
                </td>
                <td className="px-4 py-3 text-sm">
                  {manual.file_url ? (
                    <a
                      href={manual.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded"
                    >
                      Download PDF
                    </a>
                  ) : (
                    <Link
                      href="/support/request-manual?brand=toyota"
                      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      Request
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {manual.notes || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredManuals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No manuals match your current filters.</p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
