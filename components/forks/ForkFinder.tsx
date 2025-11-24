'use client';

import { useState, useMemo } from 'react';
import CarriageMeasure from './CarriageMeasure';
import Image from 'next/image';
import Link from 'next/link';

interface ForkProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url?: string;
  metadata: {
    specs_structured?: {
      thickness: number;
      width: number;
      length: number;
    };
    specifications?: {
      class: string;
      finish?: string;
    };
  };
}

interface ForkFinderProps {
  products: ForkProduct[];
}

export default function ForkFinder({ products }: ForkFinderProps) {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedLength, setSelectedLength] = useState<number | null>(null);
  const [showMeasureHelper, setShowMeasureHelper] = useState(false);

  // Filter products based on selection
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const specs = product.metadata.specs_structured;
      const productClass = product.metadata.specifications?.class;

      // Filter by Class
      if (selectedClass && productClass !== selectedClass) return false;

      // Filter by Length
      if (selectedLength && specs?.length !== selectedLength) return false;

      return true;
    });
  }, [products, selectedClass, selectedLength]);

  // Get available lengths for the selected class
  const availableLengths = useMemo(() => {
    const lengths = new Set<number>();
    products.forEach(p => {
      if (!selectedClass || p.metadata.specifications?.class === selectedClass) {
        if (p.metadata.specs_structured?.length) {
          lengths.add(p.metadata.specs_structured.length);
        }
      }
    });
    return Array.from(lengths).sort((a, b) => a - b);
  }, [products, selectedClass]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 text-white p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-canyon-rust">⚡</span> 
          Fork Finder
        </h2>
        <p className="text-slate-400 mt-1">Find the perfect fit in 30 seconds.</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Step 1: Class Selection */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-slate-900">1. Select Carriage Class</h3>
            <button 
              onClick={() => setShowMeasureHelper(!showMeasureHelper)}
              className="text-sm text-canyon-rust hover:underline font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showMeasureHelper ? 'Hide Helper' : 'Help me measure'}
            </button>
          </div>

          {showMeasureHelper && (
            <div className="mb-6 animate-in slide-in-from-top-2">
              <CarriageMeasure onClassSelect={(cls) => {
                setSelectedClass(cls);
                setShowMeasureHelper(false);
              }} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {['Class II', 'Class III', 'Class IV'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`
                  py-4 px-2 rounded-xl border-2 transition-all text-center relative
                  ${selectedClass === cls 
                    ? 'border-canyon-rust bg-orange-50 text-canyon-rust font-bold shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                <div className="text-lg">{cls}</div>
                <div className="text-xs font-normal opacity-75 mt-1">
                  {cls === 'Class II' ? '16" Height' : cls === 'Class III' ? '20" Height' : '25" Height'}
                </div>
                {selectedClass === cls && (
                  <div className="absolute -top-3 -right-3 bg-canyon-rust text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Length Selection */}
        <div className={`transition-opacity duration-300 ${!selectedClass ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="font-semibold text-lg text-slate-900 mb-4">2. Select Fork Length</h3>
          <div className="flex flex-wrap gap-3">
            {availableLengths.map((len) => (
              <button
                key={len}
                onClick={() => setSelectedLength(len === selectedLength ? null : len)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all font-medium
                  ${selectedLength === len
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }
                `}
              >
                {len}"
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="pt-6 border-t border-slate-100">
          <h3 className="font-semibold text-lg text-slate-900 mb-4">
            {filteredProducts.length} Compatible Forks Found
          </h3>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Select a class and length to see results.
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex gap-4 p-4 border border-slate-200 rounded-xl hover:border-canyon-rust transition-colors group bg-white">
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                    {product.image_url && (
                      <Image 
                        src={product.image_url} 
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-canyon-rust transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex gap-2 mt-2 text-xs text-slate-600">
                          <span className="bg-slate-100 px-2 py-1 rounded">
                            {product.metadata.specs_structured?.thickness}" Thick
                          </span>
                          <span className="bg-slate-100 px-2 py-1 rounded">
                            {product.metadata.specs_structured?.width}" Width
                          </span>
                          {product.metadata.specifications?.finish && (
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                              {product.metadata.specifications.finish}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-slate-900">
                          ${product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500">per pair</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Guaranteed Fit
                      </div>
                      <Link
                        href={`/parts/${product.slug}`}
                        className="bg-slate-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-canyon-rust transition-colors font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
