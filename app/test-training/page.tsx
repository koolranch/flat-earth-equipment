import CheckoutButton from '@/app/safety/CheckoutButton'
import Link from 'next/link'

export const metadata = {
  title: "Test Forklift Training - Admin Only",
  description: "Test page for validating forklift training flow with discount codes",
  robots: "noindex, nofollow" // Prevent search engines from indexing
}

export default function TestTrainingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧪 Test Forklift Training Flow
            </h1>
            <p className="text-gray-600">
              Admin testing page for validating the complete training experience
            </p>
          </div>

          {/* Test Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              📋 Testing Instructions
            </h2>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-semibold">1.</span>
                <span>Use the discount code <code className="bg-blue-100 px-2 py-1 rounded">TEST-FORKLIFT-100</code> for 100% off</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">2.</span>
                <span>Complete checkout (will be free with the discount code)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">3.</span>
                <span>Access training dashboard to complete modules</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">4.</span>
                <span>Complete all 5 modules and quizzes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">5.</span>
                <span>Download certificate and test evaluation forms</span>
              </div>
            </div>
          </div>

          {/* Test Purchase Options */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Single Operator Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Single Operator Test</h3>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Regular price: <span className="line-through">$59</span></p>
                <p className="text-green-600 font-semibold">With TEST-FORKLIFT-100: FREE</p>
              </div>
              <CheckoutButton 
                courseSlug="forklift"
                price="59"
                priceId="price_1RS834HJI548rO8JpJMyGhL3"
                coupon="TEST-FORKLIFT-100"
              />
            </div>

            {/* 5-Pack Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">5-Pack Test</h3>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Regular price: <span className="line-through">$275</span></p>
                <p className="text-green-600 font-semibold">With TEST-FORKLIFT-100: FREE</p>
              </div>
              <CheckoutButton 
                courseSlug="forklift"
                price="275"
                priceId="price_1RS835HJI548rO8JkMXj7FMQ"
                coupon="TEST-FORKLIFT-100"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">🔗 Quick Links for Testing</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/safety"
                className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="font-semibold text-orange-800">Safety Page</div>
                <div className="text-sm text-orange-600">Main product page</div>
              </Link>
              
              <Link
                href="/dashboard-simple"
                className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="font-semibold text-blue-800">Dashboard</div>
                <div className="text-sm text-blue-600">Training modules</div>
              </Link>
              
              <Link
                href="/login"
                className="text-center p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="font-semibold text-green-800">Login</div>
                <div className="text-sm text-green-600">Access account</div>
              </Link>
              
              <Link
                href="/evaluations/TEST-CERT-123"
                className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="font-semibold text-purple-800">Evaluation</div>
                <div className="text-sm text-purple-600">Test evaluation form</div>
              </Link>
            </div>
          </div>

          {/* Training Flow Overview */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">📚 Training Flow Overview</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mb-2 mx-auto">1</div>
                  <div>Purchase</div>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mb-2 mx-auto">2</div>
                  <div>5 Modules</div>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mb-2 mx-auto">3</div>
                  <div>Quizzes</div>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mb-2 mx-auto">4</div>
                  <div>Certificate</div>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mb-2 mx-auto">5</div>
                  <div>Evaluation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">🔑 Test Credentials</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Test Email:</strong> flatearthequip@gmail.com
              </p>
              <p className="text-sm text-yellow-800">
                <strong>Discount Code:</strong> TEST-FORKLIFT-100 (100% off)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 