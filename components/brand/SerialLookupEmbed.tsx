'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Search, MapPin } from 'lucide-react';

interface SerialLookupEmbedProps {
  brandSlug: string;
  brandName: string;
}

const serialLookupRoutes: Record<string, string> = {
  'toyota': '/toyota-forklift-serial-lookup',
  'hyster': '/hyster-serial-number-lookup',
  'bobcat': '/bobcat-serial-number-lookup',
  'crown': '/crown-serial-number-lookup',
  'clark': '/clark-serial-number-lookup',
  'cat': '/cat-serial-number-lookup',
  'caterpillar': '/cat-serial-number-lookup',
  'doosan': '/doosan-serial-number-lookup',
  'jlg': '/jlg-serial-number-lookup',
  'karcher': '/karcher-serial-number-lookup',
  'factory-cat': '/factory-cat-serial-number-lookup',
  'factorycat': '/factory-cat-serial-number-lookup',
  'tennant': '/tennant-serial-number-lookup',
  'haulotte': '/haulotte-serial-number-lookup',
  'yale': '/yale-serial-number-lookup',
  'raymond': '/raymond-serial-number-lookup',
  'ep': '/ep-forklift-serial-number-lookup',
  'ep-equipment': '/ep-forklift-serial-number-lookup',
  'linde': '/linde-forklift-serial-number-lookup',
  'mitsubishi': '/mitsubishi-serial-number-lookup',
  'komatsu': '/komatsu-serial-number-lookup',
  'case': '/case-serial-number-lookup',
  'case-construction': '/case-serial-number-lookup',
  'new-holland': '/new-holland-serial-number-lookup',
  'takeuchi': '/takeuchi-serial-number-lookup',
  'kubota': '/kubota-serial-number-lookup',
  'toro': '/toro-serial-number-lookup',
  'xcmg': '/xcmg-serial-number-lookup',
  'sinoboom': '/sinoboom-serial-number-lookup',
  'skyjack': '/skyjack-serial-number-lookup',
  'jungheinrich': '/jungheinrich-serial-number-lookup',
  'gehl': '/parts/construction-equipment-parts/gehl-serial-number-lookup',
  'hangcha': '/hangcha-serial-number-lookup',
  'lull': '/lull-serial-number-lookup',
  'manitou': '/manitou-forklift-serial-number-lookup',
  'unicarriers': '/unicarriers-serial-number-lookup',
  'jcb': '/jcb-serial-number-lookup',
  'genie': '/genie-serial-number-lookup',
  'hyundai': '/hyundai-serial-number-lookup'
};

export default function SerialLookupEmbed({ brandSlug, brandName }: SerialLookupEmbedProps) {
  const [isLoading, setIsLoading] = useState(false);
  const serialLookupUrl = serialLookupRoutes[brandSlug];

  const handleOpenLookupTool = () => {
    if (serialLookupUrl) {
      try { 
        (window as any).va?.('serial_submit', { 
          brand: brandSlug, 
          source: 'brand_hub'
        }); 
      } catch {}
      window.open(serialLookupUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!serialLookupUrl) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Serial Lookup Coming Soon
          </h3>
          <p className="text-slate-600 mb-4">
            We're working on adding serial number lookup for {brandName} equipment. 
            In the meantime, you can request assistance through our parts form.
          </p>
          <Button variant="outline">
            Request Serial Lookup Help
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {brandName} Serial Number Lookup
        </h3>
        <p className="text-slate-600">
          Find your {brandName} equipment's serial number location, decode model information, and get year/specification details.
        </p>
      </div>

      {/* Quick Launch Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-brand-accent" />
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 mb-2">
              Interactive Serial Lookup Tool
            </h4>
            <p className="text-slate-600 mb-4">
              Use our dedicated {brandName} serial lookup tool to find serial plate locations, 
              decode model information, and get year/specification details for your equipment.
            </p>
            
            <Button onClick={handleOpenLookupTool} className="mb-3">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open {brandName} Serial Lookup Tool
            </Button>
            
            <p className="text-xs text-slate-500">
              Opens in a new tab with our full-featured lookup interface
            </p>
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Serial decoding provides best-effort estimates. Always verify with manufacturer documentation for critical specifications.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-slate-900 mb-1">Find Serial Plate</h4>
              <p className="text-sm text-slate-600">
                Get step-by-step guidance on where to locate the serial number plate on your specific {brandName} model.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Search className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-slate-900 mb-1">Decode Information</h4>
              <p className="text-sm text-slate-600">
                Enter your serial number to decode model year, specifications, and other important details.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Common Serial Locations */}
      <Card className="p-6">
        <h4 className="font-semibold text-slate-900 mb-3">
          Common {brandName} Serial Plate Locations
        </h4>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
            <div>
              <span className="font-medium">Data Plate:</span> Usually located on the counterweight, mast, or operator compartment
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
            <div>
              <span className="font-medium">Engine Compartment:</span> Check the engine block or compartment walls
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-brand-accent rounded-full mt-2 flex-shrink-0" />
            <div>
              <span className="font-medium">Frame Rails:</span> Look along the main frame or chassis members
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Pro Tip:</strong> Use our interactive lookup tool above for model-specific guidance tailored to your exact {brandName} equipment type.
          </p>
        </div>
      </Card>

      {/* Embedded Preview Option (if we want to show a preview) */}
      {/* 
      <Card className="p-6 mt-6">
        <h4 className="font-semibold text-slate-900 mb-3">Quick Lookup Preview</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Serial Number
            </label>
            <input
              type="text"
              placeholder={`Enter your ${brandName} serial number`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            />
          </div>
          <Button className="w-full" onClick={handleOpenLookupTool}>
            Lookup Serial Number
          </Button>
        </div>
      </Card>
      */}
    </div>
  );
}
