'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { useT } from '@/lib/i18n';
import { analytics } from '@/lib/analytics';

export default function LoadCapacity() {
  const t = useT();
  const [ratedCap, setRatedCap] = useState(4000);
  const [ratedLC, setRatedLC] = useState(24);
  const [actualLC, setActualLC] = useState(28);
  const [attach, setAttach] = useState(0);
  const [load, setLoad] = useState(2000);
  const [hasStarted, setHasStarted] = useState(false);

  // Calculate adjusted capacity
  const adjusted = useMemo(() => {
    if (actualLC <= 0) return 0;
    return Math.max(0, Math.round(ratedCap * (ratedLC / actualLC) - attach));
  }, [ratedCap, ratedLC, actualLC, attach]);

  const safe = load <= adjusted;
  const safetyMargin = adjusted - load;
  const utilizationPct = adjusted > 0 ? Math.round((load / adjusted) * 100) : 0;

  // Track usage analytics
  useEffect(() => {
    if (!hasStarted) {
      analytics.track('tool_start', { tool: 'load_capacity' });
      setHasStarted(true);
    }
  }, [hasStarted]);

  const handleInputChange = (param: string, value: number) => {
    analytics.track('tool_param_change', {
      tool: 'load_capacity',
      param,
      value,
      adjusted_capacity: adjusted,
      safe_status: safe
    });

    if (!safe && param === 'load') {
      analytics.track('tool_warning', {
        tool: 'load_capacity',
        warning_type: 'overload',
        load_weight: value,
        adjusted_capacity: adjusted,
        excess_weight: value - adjusted
      });
    }
  };

  const InputField = ({ 
    label, 
    value, 
    onChange, 
    param, 
    unit = 'lb',
    min = 0,
    max = 50000,
    step = 1 
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    param: string;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div className="space-y-2">
      <label 
        htmlFor={`input-${param}`}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={`input-${param}`}
          className="
            w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:border-[#F76511]
            transition-colors duration-200
          "
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const newValue = +e.target.value;
            onChange(newValue);
            handleInputChange(param, newValue);
          }}
          aria-describedby={`desc-${param}`}
        />
        <span className="absolute right-3 top-2 text-xs text-slate-500 pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );

  return (
    <section className="rounded-2xl border border-slate-200 p-6 shadow-lg bg-white">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
          {t('load_capacity.title', 'Load Capacity Calculator')}
        </h2>
        <p className="text-sm text-slate-600">
          {t('load_capacity.description', 'Calculate adjusted load capacity based on load center and attachments.')}
        </p>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <InputField
          label={t('load_capacity.rated_capacity', 'Rated Capacity')}
          value={ratedCap}
          onChange={setRatedCap}
          param="rated_capacity"
          unit={t('load_capacity.lb', 'lb')}
          max={50000}
          step={100}
        />
        
        <InputField
          label={t('load_capacity.rated_load_center', 'Rated Load Center')}
          value={ratedLC}
          onChange={setRatedLC}
          param="rated_load_center"
          unit={t('load_capacity.in', 'in')}
          min={12}
          max={48}
        />
        
        <InputField
          label={t('load_capacity.actual_load_center', 'Actual Load Center')}
          value={actualLC}
          onChange={setActualLC}
          param="actual_load_center"
          unit={t('load_capacity.in', 'in')}
          min={12}
          max={60}
        />
        
        <InputField
          label={t('load_capacity.attachment_weight', 'Attachment Weight')}
          value={attach}
          onChange={setAttach}
          param="attachment_weight"
          unit={t('load_capacity.lb', 'lb')}
          max={5000}
          step={10}
        />
        
        <InputField
          label={t('load_capacity.planned_load_weight', 'Planned Load Weight')}
          value={load}
          onChange={setLoad}
          param="planned_load_weight"
          unit={t('load_capacity.lb', 'lb')}
          max={50000}
          step={50}
        />
      </div>

      {/* Results Section */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-medium text-[#0F172A] mb-4">
          {t('load_capacity.results', 'Calculation Results')}
        </h3>
        
        {/* Main Result */}
        <div 
          className="mb-4 p-4 rounded-lg bg-slate-50"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              {t('load_capacity.adjusted_capacity', 'Adjusted Capacity')}:
            </span>
            <span className="text-lg font-bold text-[#0F172A]">
              {adjusted.toLocaleString()} {t('load_capacity.lb', 'lb')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${safe 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
              }
            `}>
              {safe 
                ? t('load_capacity.safe_estimated', 'Safe (estimated)')
                : t('load_capacity.not_safe_estimated', 'Not safe (estimated)')
              }
            </div>
            
            <span className="text-xs text-slate-500">
              {utilizationPct}% {t('load_capacity.utilization', 'utilization')}
            </span>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-blue-50">
            <div className="text-sm font-medium text-blue-800 mb-1">
              {t('load_capacity.safety_margin', 'Safety Margin')}
            </div>
            <div className={`text-lg font-bold ${safe ? 'text-blue-700' : 'text-red-700'}`}>
              {safe ? '+' : ''}{safetyMargin.toLocaleString()} {t('load_capacity.lb', 'lb')}
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-amber-50">
            <div className="text-sm font-medium text-amber-800 mb-1">
              {t('load_capacity.capacity_reduction', 'Capacity Reduction')}
            </div>
            <div className="text-lg font-bold text-amber-700">
              {actualLC > ratedLC 
                ? `${Math.round(((ratedCap - (ratedCap * ratedLC / actualLC)) / ratedCap) * 100)}%`
                : '0%'
              }
            </div>
          </div>
        </div>

        {/* Safety Recommendations */}
        {!safe && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-4">
            <h4 className="font-medium text-red-800 mb-2">
              ⚠️ {t('load_capacity.safety_recommendations', 'Safety Recommendations')}
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• {t('load_capacity.reduce_load_weight', 'Reduce load weight to stay within capacity')}</li>
              <li>• {t('load_capacity.move_load_closer', 'Move load closer to the mast if possible')}</li>
              <li>• {t('load_capacity.consider_attachment', 'Consider removing or changing attachment')}</li>
              <li>• {t('load_capacity.use_higher_capacity', 'Use a higher capacity forklift')}</li>
            </ul>
          </div>
        )}

        {/* Formula Explanation */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            {t('load_capacity.calculation_formula', 'Calculation Formula')}
          </h4>
          <code className="text-xs text-slate-600 block mb-2">
            {t('load_capacity.formula', 'Adjusted Capacity = (Rated Capacity × Rated Load Center ÷ Actual Load Center) - Attachment Weight')}
          </code>
          <div className="text-xs text-slate-600">
            {ratedCap.toLocaleString()} × {ratedLC} ÷ {actualLC} - {attach.toLocaleString()} = <strong>{adjusted.toLocaleString()} {t('load_capacity.lb', 'lb')}</strong>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <p className="text-xs text-yellow-800">
          <strong>{t('load_capacity.disclaimer_title', 'Important Disclaimer')}:</strong>{' '}
          {t('load_capacity.disclaimer_text', 'This is a training estimate only. Always consult the forklift\'s capacity plate and manufacturer documentation for official load ratings. Actual capacity may vary based on additional factors including mast height, tilt angle, and operating conditions.')}
        </p>
      </div>
    </section>
  );
}
