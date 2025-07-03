'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function TestAutoLoginPage() {
  const [sessionId, setSessionId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAutoLogin = async () => {
    if (!sessionId.trim()) {
      alert('Please enter a session ID')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/auto-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.trim() })
      })

      const data = await response.json()
      setResult({ status: response.status, data })

      if (response.ok && data.loginUrl) {
        console.log('Auto-login URL:', data.loginUrl)
        // Don't automatically redirect in test mode
      }
    } catch (error) {
      setResult({ status: 'error', data: { error: error instanceof Error ? error.message : 'Unknown error' } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧪 Test Auto-Login After Purchase
            </h1>
            <p className="text-gray-600">
              Test the automatic login functionality for training purchases
            </p>
          </div>

          {/* Test Auto-Login */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              🔐 Auto-Login Test
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Session ID (from recent purchase):
                </label>
                <input
                  type="text"
                  id="sessionId"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="cs_test_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use the session ID from a successful training purchase
                </p>
              </div>
              
              <button
                onClick={testAutoLogin}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Auto-Login'}
              </button>
              
              {/* Current Implementation Status */}
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-2">✅ Current Implementation:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Direct token-based authentication (no redirects)</li>
                  <li>• Magic link fallback for compatibility</li>
                  <li>• Automatic session cleanup after login</li>
                  <li>• Seamless redirect to dashboard after purchase</li>
                </ul>
              </div>
              
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h3 className="font-semibold text-amber-800 mb-2">🔄 How it works now:</h3>
                <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Purchase completes → redirect to dashboard with session_id</li>
                  <li>Dashboard detects session_id but no authenticated user</li>
                  <li>Calls auto-login API to get authentication tokens</li>
                  <li>Signs user in directly with tokens (no redirect needed)</li>
                  <li>Cleans up URL and continues to dashboard</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Test Results:</h3>
              
              <div className="mb-4">
                <span className="font-medium">Status: </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.status}
                </span>
              </div>
              
              <pre className="bg-white p-4 rounded border overflow-auto text-sm">
                {JSON.stringify(result.data, null, 2)}
              </pre>
              
              {result.data.loginUrl && (
                <div className="mt-4">
                  <p className="font-medium mb-2">🚀 Auto-Login URL Generated:</p>
                  <a 
                    href={result.data.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Click to Auto-Login (New Tab)
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
              📋 How to Test:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
              <li>Make a test purchase using your Stripe test keys</li>
              <li>Copy the Stripe session ID from the successful checkout</li>
              <li>Paste it in the input field above and click "Test Auto-Login"</li>
              <li>If successful, you'll get a magic link that logs you in automatically</li>
              <li>Click the magic link to test the full flow</li>
            </ol>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/safety"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Test Purchase Flow
            </Link>
            <Link
              href="/dashboard-simple"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Dashboard
            </Link>
            <Link
              href="/test-training"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Test Training
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 