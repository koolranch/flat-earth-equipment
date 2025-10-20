"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { hysterFaultCodes } from '@/lib/data/hysterFaultCodes';

export default function HysterCodeBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCodes = useMemo(() => {
    let codes = hysterFaultCodes;
    
    if (selectedCategory !== 'all') {
      codes = codes.filter(c => c.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      codes = codes.filter(c => 
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.phenomenon?.toLowerCase().includes(q) ||
        c.system.toLowerCase().includes(q)
      );
    }
    
    return codes;
  }, [searchQuery, selectedCategory]);

  const categories = ['Communication', 'EEPROM', 'Display', 'Sensor', 'Electrical', 'Hydraulic', 'Safety', 'Engine', 'Transmission'];

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search codes... (e.g., 'AL01' or 'battery' or 'hydraulic')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] text-slate-900 placeholder:text-slate-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F76511] text-slate-900"
        >
          <option value="all">All Systems ({hysterFaultCodes.length} codes)</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat} ({hysterFaultCodes.filter(c => c.category === cat).length})
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-slate-600">
        Showing <strong>{filteredCodes.length}</strong> code{filteredCodes.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Code List */}
      <div className="space-y-2">
        {filteredCodes.map((item) => (
          <details key={item.code} className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden hover:border-[#F76511] transition-all">
            <summary className="cursor-pointer p-4 hover:bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="font-mono font-bold text-lg text-[#F76511] flex-shrink-0">{item.code}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{item.description}</div>
                  <div className="text-xs text-slate-600">{item.system}</div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded flex-shrink-0 ml-2 ${
                item.severity === 'High' ? 'bg-red-100 text-red-700' :
                item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {item.severity}
              </span>
            </summary>
            <div className="p-4 pt-0 text-sm space-y-2 bg-slate-50 border-t border-slate-200">
              <div><span className="font-semibold text-slate-700">System:</span> <span className="text-slate-600">{item.system}</span></div>
              {item.phenomenon && (
                <div><span className="font-semibold text-slate-700">Symptom:</span> <span className="text-slate-600">{item.phenomenon}</span></div>
              )}
              <div><span className="font-semibold text-slate-700">Causes:</span> <span className="text-slate-600">{item.causes || 'See troubleshooting'}</span></div>
              <div><span className="font-semibold text-slate-700">Fix:</span> <span className="text-slate-600">{item.troubleshooting || 'Diagnostic tool required'}</span></div>
            </div>
          </details>
        ))}
      </div>

      {filteredCodes.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <p className="text-slate-600">No codes found matching your search.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-4 text-[#F76511] hover:text-orange-600 font-semibold text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

