"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { toyotaFaultCodes } from '@/lib/data/toyotaFaultCodes';

export default function ToyotaCodeBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCodes = useMemo(() => {
    let codes = toyotaFaultCodes;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      codes = codes.filter(c => c.category === selectedCategory);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      codes = codes.filter(c => 
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.phenomenon.toLowerCase().includes(q) ||
        c.system.toLowerCase().includes(q)
      );
    }
    
    return codes;
  }, [searchQuery, selectedCategory]);

  const icCodes = filteredCodes.filter(c => c.category === 'IC');
  const electricCodes = filteredCodes.filter(c => c.category === 'Electric');
  const sasCodes = filteredCodes.filter(c => c.category === 'SAS');
  const specialCodes = filteredCodes.filter(c => c.category === 'Special');

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search codes... (e.g., '01-01' or 'fuel' or 'sensor')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511] text-slate-900 placeholder:text-slate-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F76511] text-slate-900"
        >
          <option value="all">All Systems ({toyotaFaultCodes.length} codes)</option>
          <option value="IC">IC Engine ({toyotaFaultCodes.filter(c => c.category === 'IC').length})</option>
          <option value="Electric">Electric ({toyotaFaultCodes.filter(c => c.category === 'Electric').length})</option>
          <option value="SAS">SAS/OPS ({toyotaFaultCodes.filter(c => c.category === 'SAS').length})</option>
          <option value="Special">Common ({toyotaFaultCodes.filter(c => c.category === 'Special').length})</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-slate-600">
        Showing <strong>{filteredCodes.length}</strong> code{filteredCodes.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Special/Common Codes - Always Visible */}
      {specialCodes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-100 text-[#F76511] rounded-full flex items-center justify-center font-bold text-sm">⚡</span>
            Most Common Codes
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {specialCodes.map((item) => (
              <div key={item.code} className="flex items-start gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg hover:border-[#F76511] transition-all">
                <div className="flex-shrink-0">
                  <div className="font-mono font-bold text-lg text-[#F76511]">{item.code}</div>
                  <div className={`text-xs font-semibold mt-1 ${
                    item.severity === 'High' ? 'text-red-600' :
                    item.severity === 'Medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {item.severity}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 mb-1">{item.description}</div>
                  <div className="text-xs text-slate-600">{item.phenomenon}</div>
                  {item.hasGuide && (
                    <Link href={item.link!} className="text-xs text-[#F76511] hover:text-orange-600 font-semibold mt-2 inline-block">
                      View Full Guide →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IC Codes */}
      {icCodes.length > 0 && (
        <details className="group bg-white border-2 border-slate-200 rounded-xl overflow-hidden mb-3" open={selectedCategory === 'IC'}>
          <summary className="cursor-pointer p-4 font-bold text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-xl">⛽</span> Internal Combustion Engine Codes ({icCodes.length})
            </span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="p-4 pt-0 bg-slate-50 max-h-[600px] overflow-y-auto">
            <div className="space-y-2">
              {icCodes.map((item) => (
                <details key={item.code} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <summary className="cursor-pointer p-3 hover:bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#F76511]">{item.code}</span>
                      <span className="text-sm text-slate-900">{item.description}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      item.severity === 'High' ? 'bg-red-100 text-red-700' :
                      item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.severity}
                    </span>
                  </summary>
                  <div className="p-3 pt-0 text-sm space-y-2 bg-slate-50">
                    <div><span className="font-semibold text-slate-700">System:</span> <span className="text-slate-600">{item.system}</span></div>
                    <div><span className="font-semibold text-slate-700">Symptom:</span> <span className="text-slate-600">{item.phenomenon}</span></div>
                    <div><span className="font-semibold text-slate-700">Causes:</span> <span className="text-slate-600">{item.causes}</span></div>
                    <div><span className="font-semibold text-slate-700">Fix:</span> <span className="text-slate-600">{item.troubleshooting}</span></div>
                    {item.hasGuide && (
                      <Link href={item.link!} className="inline-block mt-2 text-xs text-[#F76511] hover:text-orange-600 font-semibold">
                        View Detailed Guide →
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </details>
      )}

      {/* Electric Codes */}
      {electricCodes.length > 0 && (
        <details className="group bg-white border-2 border-slate-200 rounded-xl overflow-hidden mb-3" open={selectedCategory === 'Electric'}>
          <summary className="cursor-pointer p-4 font-bold text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-xl">🔋</span> Electric Forklift Codes ({electricCodes.length})
            </span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="p-4 pt-0 bg-slate-50">
            <div className="space-y-2">
              {electricCodes.map((item) => (
                <details key={item.code} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <summary className="cursor-pointer p-3 hover:bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#F76511]">{item.code}</span>
                      <span className="text-sm text-slate-900">{item.description}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      item.severity === 'High' ? 'bg-red-100 text-red-700' :
                      item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.severity}
                    </span>
                  </summary>
                  <div className="p-3 pt-0 text-sm space-y-2 bg-slate-50">
                    <div><span className="font-semibold text-slate-700">System:</span> <span className="text-slate-600">{item.system}</span></div>
                    <div><span className="font-semibold text-slate-700">Symptom:</span> <span className="text-slate-600">{item.phenomenon}</span></div>
                    <div><span className="font-semibold text-slate-700">Causes:</span> <span className="text-slate-600">{item.causes}</span></div>
                    <div><span className="font-semibold text-slate-700">Fix:</span> <span className="text-slate-600">{item.troubleshooting}</span></div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </details>
      )}

      {/* SAS/OPS Codes */}
      {sasCodes.length > 0 && (
        <details className="group bg-white border-2 border-slate-200 rounded-xl overflow-hidden mb-3" open={selectedCategory === 'SAS'}>
          <summary className="cursor-pointer p-4 font-bold text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-xl">🛡️</span> SAS/OPS Stability & Safety Codes ({sasCodes.length})
            </span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="p-4 pt-0 bg-slate-50 max-h-[600px] overflow-y-auto">
            <div className="space-y-2">
              {sasCodes.map((item) => (
                <details key={item.code} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <summary className="cursor-pointer p-3 hover:bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#F76511]">{item.code}</span>
                      <span className="text-sm text-slate-900">{item.description}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      item.severity === 'High' ? 'bg-red-100 text-red-700' :
                      item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.severity}
                    </span>
                  </summary>
                  <div className="p-3 pt-0 text-sm space-y-2 bg-slate-50">
                    <div><span className="font-semibold text-slate-700">System:</span> <span className="text-slate-600">{item.system}</span></div>
                    <div><span className="font-semibold text-slate-700">Symptom:</span> <span className="text-slate-600">{item.phenomenon}</span></div>
                    <div><span className="font-semibold text-slate-700">Causes:</span> <span className="text-slate-600">{item.causes}</span></div>
                    <div><span className="font-semibold text-slate-700">Fix:</span> <span className="text-slate-600">{item.troubleshooting}</span></div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </details>
      )}

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

