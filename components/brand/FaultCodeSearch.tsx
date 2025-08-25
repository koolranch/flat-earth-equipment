'use client';

import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Info, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FaultCodeSearchProps {
  brandSlug: string;
  brandName: string;
}

interface FaultCode {
  id: number;
  code: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  solution: string;
  equipment_type: string;
  manual_reference?: string;
  source_url?: string;
}

interface SearchFilters {
  categories: string[];
  equipment_types: string[];
}

const severityConfig = {
  low: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  medium: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  high: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  critical: { icon: Zap, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
};

export default function FaultCodeSearch({ brandSlug, brandName }: FaultCodeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('');
  const [faultCodes, setFaultCodes] = useState<FaultCode[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({ categories: [], equipment_types: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load initial data and filters
  useEffect(() => {
    loadInitialData();
  }, [brandSlug]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/fault-codes/search?brand_slug=${brandSlug}`);
      const data = await response.json();
      
      if (response.ok) {
        setFaultCodes(data.results);
        setFilters(data.filters);
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Failed to load fault codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/fault-codes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_slug: brandSlug,
          code: searchQuery,
          category: selectedCategory || undefined,
          equipment_type: selectedEquipmentType || undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setFaultCodes(data.results);
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedEquipmentType('');
    loadInitialData();
  };

  const FaultCodeCard = ({ faultCode }: { faultCode: FaultCode }) => {
    const severityInfo = severityConfig[faultCode.severity];
    const SeverityIcon = severityInfo.icon;

    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg text-slate-900">
              {faultCode.code}
            </span>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${severityInfo.bg} ${severityInfo.color} ${severityInfo.border} border`}>
              <SeverityIcon className="w-3 h-3" />
              {faultCode.severity.toUpperCase()}
            </div>
          </div>
          {faultCode.category && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
              {faultCode.category}
            </span>
          )}
        </div>

        <h4 className="font-medium text-slate-900 mb-2">{faultCode.description}</h4>
        
        {faultCode.solution && (
          <div className="mb-3">
            <p className="text-sm text-slate-600 font-medium mb-1">Solution:</p>
            <p className="text-sm text-slate-700">{faultCode.solution}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          {faultCode.equipment_type && (
            <span>Equipment: {faultCode.equipment_type}</span>
          )}
          {faultCode.manual_reference && (
            <span>Manual: {faultCode.manual_reference}</span>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {brandName} Fault Code Database
        </h3>
        <p className="text-slate-600">
          Search our database of {brandName} fault codes to quickly identify and resolve equipment issues.
        </p>
      </div>

      {/* Search Controls */}
      <Card className="p-4 mb-6">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Enter fault code or description (e.g., E001, hydraulic, engine)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Equipment Type
              </label>
              <select
                value={selectedEquipmentType}
                onChange={(e) => setSelectedEquipmentType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
              >
                <option value="">All Equipment</option>
                {filters.equipment_types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
              >
                <option value="">All Categories</option>
                {filters.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetSearch}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-slate-600">Searching fault codes...</p>
        </div>
      ) : hasSearched ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">
              {faultCodes.length === 0 
                ? 'No fault codes found' 
                : `${faultCodes.length} fault code${faultCodes.length === 1 ? '' : 's'} found`
              }
            </h4>
            
            {faultCodes.length > 0 && (
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Low
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Medium
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  High
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Critical
                </div>
              </div>
            )}
          </div>

          {faultCodes.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="font-medium text-slate-900 mb-2">No fault codes found</h4>
              <p className="text-slate-600 mb-4">
                Try adjusting your search terms or filters. If you can't find a specific code, 
                you can request help through our parts form.
              </p>
              <Button variant="outline" onClick={resetSearch}>
                View All Codes
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {faultCodes.map((faultCode) => (
                <FaultCodeCard key={faultCode.id} faultCode={faultCode} />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Need Additional Help?</h4>
        <p className="text-blue-700 text-sm">
          Can't find the fault code you're looking for? Our technical team can help identify the issue and recommend solutions. 
          Use the Parts Request tab to describe your problem and we'll get back to you with expert guidance.
        </p>
      </div>
    </div>
  );
}
