'use client'

import { useState } from 'react'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export function BMSCompatibilityChecker() {
  const [chargerProtocol, setChargerProtocol] = useState('')
  const [bmsProtocol, setBmsProtocol] = useState('')
  const [voltage, setVoltage] = useState('')
  const [batteryVoltage, setBatteryVoltage] = useState('')
  const [result, setResult] = useState<{
    compatible: boolean
    issues: string[]
    recommendations: string[]
  } | null>(null)

  const checkCompatibility = () => {
    const issues: string[] = []
    const recommendations: string[] = []
    let compatible = true

    // Check voltage compatibility
    if (voltage && batteryVoltage) {
      const chargerV = parseFloat(voltage)
      const batteryV = parseFloat(batteryVoltage)
      const tolerance = batteryV * 0.05 // 5% tolerance
      
      if (Math.abs(chargerV - batteryV) > tolerance) {
        compatible = false
        issues.push(`Voltage mismatch: Charger ${chargerV}V vs Battery ${batteryV}V`)
        recommendations.push('Ensure exact voltage match between charger and battery')
      }
    }

    // Check protocol compatibility
    if (chargerProtocol && bmsProtocol) {
      if (chargerProtocol !== bmsProtocol) {
        compatible = false
        issues.push(`Protocol mismatch: ${chargerProtocol} charger vs ${bmsProtocol} BMS`)
        recommendations.push('Select charger and BMS with matching communication protocols')
      }
    }

    // Add general recommendations
    if (compatible) {
      recommendations.push('Verify message IDs and data formats are compatible')
      recommendations.push('Test communication before full installation')
      recommendations.push('Ensure proper cable termination (120Ω for CAN bus)')
    }

    setResult({ compatible, issues, recommendations })
  }

  const getStatusIcon = () => {
    if (!result) return null
    
    if (result.compatible && result.issues.length === 0) {
      return <CheckCircleIcon className="h-8 w-8 text-green-600" />
    } else if (result.issues.length > 0) {
      return <XCircleIcon className="h-8 w-8 text-red-600" />
    } else {
      return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
    }
  }

  const getStatusText = () => {
    if (!result) return ''
    
    if (result.compatible && result.issues.length === 0) {
      return 'Compatible Configuration'
    } else if (result.issues.length > 0) {
      return 'Compatibility Issues Found'
    } else {
      return 'Verification Needed'
    }
  }

  const getStatusColor = () => {
    if (!result) return ''
    
    if (result.compatible && result.issues.length === 0) {
      return 'text-green-800 bg-green-50 border-green-200'
    } else if (result.issues.length > 0) {
      return 'text-red-800 bg-red-50 border-red-200'
    } else {
      return 'text-yellow-800 bg-yellow-50 border-yellow-200'
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 my-8">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircleIcon className="h-6 w-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-slate-900">BMS Compatibility Checker</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Charger Communication Protocol
          </label>
          <select
            value={chargerProtocol}
            onChange={(e) => setChargerProtocol(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select Protocol</option>
            <option value="CAN Bus">CAN Bus</option>
            <option value="RS485">RS485/Modbus</option>
            <option value="Proprietary">Proprietary</option>
            <option value="None">No BMS Communication</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            BMS Communication Protocol
          </label>
          <select
            value={bmsProtocol}
            onChange={(e) => setBmsProtocol(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select Protocol</option>
            <option value="CAN Bus">CAN Bus</option>
            <option value="RS485">RS485/Modbus</option>
            <option value="Proprietary">Proprietary</option>
            <option value="None">No Communication</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Charger Output Voltage
          </label>
          <select
            value={voltage}
            onChange={(e) => setVoltage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select Voltage</option>
            <option value="25.6">24V (25.6V)</option>
            <option value="38.4">36V (38.4V)</option>
            <option value="51.2">48V (51.2V)</option>
            <option value="85.3">80V (85.3V)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Battery Nominal Voltage
          </label>
          <select
            value={batteryVoltage}
            onChange={(e) => setBatteryVoltage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select Voltage</option>
            <option value="25.6">24V (25.6V)</option>
            <option value="38.4">36V (38.4V)</option>
            <option value="51.2">48V (51.2V)</option>
            <option value="85.3">80V (85.3V)</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={checkCompatibility}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
      >
        Check BMS Compatibility
      </button>
      
      {result && (
        <div className={`mt-6 p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-3 mb-3">
            {getStatusIcon()}
            <h4 className="font-semibold text-lg">{getStatusText()}</h4>
          </div>
          
          {result.issues.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2">Issues Found:</h5>
              <ul className="space-y-1">
                {result.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {result.recommendations.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Recommendations:</h5>
              <ul className="space-y-1">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
