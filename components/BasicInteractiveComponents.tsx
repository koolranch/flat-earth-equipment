'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, CalculatorIcon } from '@heroicons/react/24/outline'

// Simplified Amperage Calculator for Phase 2
export function AmperageCalculator() {
  const [batteryAh, setBatteryAh] = useState('')
  const [chargeHours, setChargeHours] = useState('')
  const [result, setResult] = useState<number | null>(null)

  const calculate = () => {
    if (batteryAh && chargeHours) {
      const ah = parseFloat(batteryAh)
      const hours = parseFloat(chargeHours)
      const efficiency = 0.85
      const calculatedAmps = (ah / hours) / efficiency
      setResult(Math.round(calculatedAmps))
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 my-8">
      <div className="flex items-center gap-3 mb-4">
        <CalculatorIcon className="h-6 w-6 text-canyon-rust" />
        <h3 className="text-lg font-semibold text-slate-900">Amperage Calculator</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Battery Capacity (Ah)
          </label>
          <input
            type="number"
            value={batteryAh}
            onChange={(e) => setBatteryAh(e.target.value)}
            placeholder="e.g., 750"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Desired Charge Time (hours)
          </label>
          <input
            type="number"
            value={chargeHours}
            onChange={(e) => setChargeHours(e.target.value)}
            placeholder="e.g., 8"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust"
          />
        </div>
      </div>
      
      <button
        onClick={calculate}
        className="w-full bg-canyon-rust text-white py-2 px-4 rounded-lg hover:bg-canyon-rust/90 transition-colors font-medium"
      >
        Calculate Required Amperage
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-canyon-rust">{result}A</div>
            <div className="text-sm text-slate-600">Recommended charger amperage</div>
            <div className="text-xs text-slate-500 mt-2">
              Based on {batteryAh}Ah battery charged in {chargeHours} hours (85% efficiency)
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Simplified Table of Contents for Phase 2
export function TableOfContents() {
  const [isOpen, setIsOpen] = useState(false)
  
  const sections = [
    { id: 'forklift-charger-basics', title: 'Forklift Charger Basics' },
    { id: 'voltage-selection-guide', title: 'Voltage Selection Guide' },
    { id: 'amperage-calculation-guide', title: 'Amperage Calculation' },
    { id: 'power-input-requirements', title: 'Power Input Requirements' },
    { id: 'brand-compatibility-guide', title: 'Brand Compatibility' },
    { id: 'charging-methods-comparison', title: 'Charging Methods' },
    { id: 'installation-requirements', title: 'Installation Requirements' },
    { id: 'safety-considerations', title: 'Safety Considerations' },
    { id: 'troubleshooting-guide', title: 'Troubleshooting Guide' },
    { id: 'maintenance-best-practices', title: 'Maintenance Best Practices' },
    { id: 'cost-analysis-and-roi', title: 'Cost Analysis & ROI' },
    { id: 'future-technology-trends', title: 'Future Technology Trends' },
  ]

  return (
    <div className="lg:sticky lg:top-20 bg-white border border-gray-200 rounded-lg shadow-sm mb-8 lg:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium text-gray-900 hover:bg-gray-50 lg:cursor-default"
      >
        📋 Table of Contents
        <span className="lg:hidden">
          {isOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        </span>
      </button>
      
      <nav className={`border-t border-gray-200 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <ul className="py-2 max-h-96 overflow-y-auto">
          {sections.map(({ id, title }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-canyon-rust transition-colors"
                onClick={() => setIsOpen(false)} // Close on mobile after click
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

// Quick Reference Card Component
export function QuickReferenceCard({
  title,
  items
}: {
  title: string
  items: Array<{ label: string; value: string; highlight?: boolean }>
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-6">
      <h4 className="font-semibold text-slate-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-slate-600">{item.label}:</span>
            <span className={`font-medium ${
              item.highlight ? 'text-canyon-rust' : 'text-slate-900'
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
