'use client'

import { useState } from 'react'
import { CalculatorIcon } from '@heroicons/react/24/outline'

// TCO Comparison Calculator for Lead-Acid vs Lithium
export function TCOComparisonCalculator() {
  const [forklifts, setForklifts] = useState('')
  const [electricityRate, setElectricityRate] = useState('0.12')
  const [results, setResults] = useState<{
    leadAcid: { initial: number; annual: number; fiveYear: number }
    lithium: { initial: number; annual: number; fiveYear: number }
    savings: number
    roiYears: number
  } | null>(null)

  const calculate = () => {
    if (forklifts) {
      const fleetSize = parseFloat(forklifts)
      const rate = parseFloat(electricityRate)

      // Lead-acid system costs
      const leadAcidInitial = fleetSize * 16500 // charger + batteries + infrastructure
      const leadAcidAnnual = fleetSize * (1500 + rate * 2500) // maintenance + electricity
      const leadAcidFiveYear = leadAcidInitial + (leadAcidAnnual * 5) + (fleetSize * 8000) // battery replacement

      // Lithium system costs
      const lithiumInitial = fleetSize * 22750 // charger + battery + minimal infrastructure
      const lithiumAnnual = fleetSize * (300 + rate * 1500) // low maintenance + efficient electricity
      const lithiumFiveYear = lithiumInitial + (lithiumAnnual * 5) // no battery replacement needed

      const savings = leadAcidFiveYear - lithiumFiveYear
      const extraCost = lithiumInitial - leadAcidInitial
      const annualSavings = leadAcidAnnual - lithiumAnnual
      const roiYears = extraCost / annualSavings

      setResults({
        leadAcid: {
          initial: leadAcidInitial,
          annual: leadAcidAnnual,
          fiveYear: leadAcidFiveYear
        },
        lithium: {
          initial: lithiumInitial,
          annual: lithiumAnnual,
          fiveYear: lithiumFiveYear
        },
        savings,
        roiYears: Math.round(roiYears * 10) / 10
      })
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6 my-8">
      <div className="flex items-center gap-3 mb-4">
        <CalculatorIcon className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Lead-Acid vs Lithium TCO Calculator</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Number of Forklifts
          </label>
          <input
            type="number"
            value={forklifts}
            onChange={(e) => setForklifts(e.target.value)}
            placeholder="e.g., 5"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Electricity Rate ($/kWh)
          </label>
          <input
            type="number"
            step="0.01"
            value={electricityRate}
            onChange={(e) => setElectricityRate(e.target.value)}
            placeholder="0.12"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-green-700 transition-colors font-medium"
      >
        Calculate 5-Year TCO Comparison
      </button>
      
      {results && (
        <div className="mt-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                Lead-Acid System
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Initial Cost:</span>
                  <span className="font-medium">${results.leadAcid.initial.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Annual Cost:</span>
                  <span className="font-medium">${results.leadAcid.annual.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600">5-Year Total:</span>
                  <span className="font-bold text-lg">${results.leadAcid.fiveYear.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-green-200 p-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Lithium System
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Initial Cost:</span>
                  <span className="font-medium">${results.lithium.initial.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Annual Cost:</span>
                  <span className="font-medium">${results.lithium.annual.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600">5-Year Total:</span>
                  <span className="font-bold text-lg">${results.lithium.fiveYear.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-green-800 font-medium">Total 5-Year Savings with Lithium</div>
              <div className="text-3xl font-bold text-green-600">${results.savings.toLocaleString()}</div>
              <div className="text-sm text-green-700 mt-2">
                ROI achieved in {results.roiYears} years | {Math.round((results.savings / results.leadAcid.fiveYear) * 100)}% cost reduction
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
