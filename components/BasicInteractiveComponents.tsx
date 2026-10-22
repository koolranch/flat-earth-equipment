'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

const CHARGER_VOLTAGES = ['24', '36', '48', '80'] as const

function buildChargerBrowseHref(voltage?: string, amps?: number | null): string {
  const params = new URLSearchParams()
  if (voltage && CHARGER_VOLTAGES.includes(voltage as (typeof CHARGER_VOLTAGES)[number])) {
    params.set('v', voltage)
  }
  if (typeof amps === 'number' && Number.isFinite(amps) && amps > 0) {
    params.set('a', String(amps))
  }
  const qs = params.toString()
  return qs ? `/battery-chargers?${qs}#chargers` : '/battery-chargers#chargers'
}

// Simplified Amperage Calculator for Phase 2
export function AmperageCalculator() {
  return (
    <div className="not-prose bg-slate-50 border border-slate-200 rounded-xl p-6 my-8">
      <h3 className="text-lg font-semibold text-slate-900">Charger amperage</h3>
      <p className="mt-2 text-slate-700">
        This page does not publish a required amperage. The charger price and voltage are on the product page.
      </p>
      <a
        href="/battery-chargers"
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-canyon-rust px-4 py-2 text-sm font-semibold text-white"
      >
        Browse chargers
      </a>
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

type QuickRefItem = { label: string; value: string; highlight?: boolean }

function parseQuickRefItems(
  items?: QuickRefItem[],
  itemsJson?: string
): QuickRefItem[] {
  if (Array.isArray(items) && items.length > 0) return items
  if (typeof itemsJson === 'string' && itemsJson.trim()) {
    try {
      const parsed = JSON.parse(itemsJson.replace(/&#39;/g, "'"))
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// Quick Reference Card Component
// next-mdx-remote RSC only passes string literal props — use itemsJson='[...]' and voltage="48" in MDX
export function QuickReferenceCard({
  title,
  items,
  itemsJson,
  voltage,
}: {
  title: string
  items?: QuickRefItem[]
  itemsJson?: string
  /** String literal only in MDX, e.g. voltage="48" */
  voltage?: string
}) {
  const resolvedItems = parseQuickRefItems(items, itemsJson)
  if (resolvedItems.length === 0) return null

  const browseHref =
    voltage && CHARGER_VOLTAGES.includes(voltage as (typeof CHARGER_VOLTAGES)[number])
      ? buildChargerBrowseHref(voltage)
      : null

  return (
    <div className="not-prose bg-slate-50 border border-slate-200 rounded-lg p-4 my-6">
      <h4 className="font-semibold text-slate-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {resolvedItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center gap-3">
            <span className="text-slate-600">{item.label}:</span>
            <span className={`font-medium text-right ${
              item.highlight ? 'text-canyon-rust' : 'text-slate-900'
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      {browseHref && (
        <a
          href={browseHref}
          className="mt-4 inline-flex text-sm font-semibold text-canyon-rust hover:underline"
        >
          Browse {voltage}V chargers →
        </a>
      )}
    </div>
  )
}

// ROI Calculator for Charging Strategy Comparison
export function ChargingROICalculator() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 my-8">
      <h3 className="text-lg font-semibold text-slate-900">Charging cost</h3>
      <p className="mt-2 text-slate-700">
        The price is on the product page. This page does not publish a setup cost or a five-year total.
      </p>
    </div>
  )
}

// Lithium Charging Calculator
export function LithiumChargingCalculator() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 my-8">
      <h3 className="text-lg font-semibold text-slate-900">Lithium charging</h3>
      <p className="mt-2 text-slate-700">
        The price is on the product page. This page does not publish a charger amperage or a charge time.
      </p>
    </div>
  )
}
