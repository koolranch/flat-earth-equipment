'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import EvalSignature from '@/components/EvalSignature'
import { uploadEval } from '@/utils/uploadEval'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CertificateData {
  id: string
  user_id: string
  course_title: string
  completed_at: string
  operator_name: string
}

interface EvaluationChecks {
  [key: string]: 'pass' | 'retrain'
}

const EVALUATION_SKILLS = [
  { id: 'pre_fluid', label: 'Fluid levels, tires, forks, mast, devices' },
  { id: 'pre_belt', label: 'Seatbelt usage' },
  { id: 'op_mount', label: 'Mount / Dismount (3-point)' },
  { id: 'op_load', label: 'Load handling & tilt back' },
  { id: 'op_speed', label: 'Travel speed ≤ 5 mph' },
  { id: 'op_horn', label: 'Horn at intersections' },
  { id: 'op_ped', label: 'Pedestrian awareness' },
  { id: 'op_ramp', label: 'Ramp parking technique' },
  { id: 'park_proc', label: 'Parking procedure' },
  { id: 'op_control', label: 'Overall smooth control' }
]

export default function EvaluationWizard() {
  const params = useParams()
  const router = useRouter()
  const certificateId = params.certificateId as string
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [equipmentType, setEquipmentType] = useState('')
  const [checks, setChecks] = useState<EvaluationChecks>({})
  const [signature, setSignature] = useState<{ type: 'typed' | 'drawn', data: string } | null>(null)
  const [supervisorEmail, setSupervisorEmail] = useState('')

  useEffect(() => {
    fetchCertificate()
  }, [certificateId])

  const fetchCertificate = async () => {
    try {
      console.log('🔍 Fetching certificate for ID:', certificateId)
      
      // For demo/testing purposes, if certificate ID contains 'test' or 'demo', create a demo certificate
      if (certificateId.toLowerCase().includes('test') || certificateId.toLowerCase().includes('demo')) {
        console.log('🎭 Creating demo certificate for testing:', certificateId)
        setCertificate({
          id: certificateId,
          user_id: 'demo-user-id',
          course_title: 'Forklift Operator Safety Training',
          completed_at: new Date().toISOString(),
          operator_name: 'Demo Operator (Test Certificate)'
        })
        setLoading(false)
        return
      }
      
      const { data: enrollment, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          user_id,
          created_at,
          course_id
        `)
        .eq('id', certificateId)
        .single()
      
      console.log('📋 Supabase query result:', { enrollment, error })
      
      if (error) {
        console.error('❌ Supabase error:', error)
        
        // If certificate not found, show a demo/test version
        if (error.code === 'PGRST116' || error.message?.includes('No rows returned')) {
          console.log('🎭 Certificate not found, creating demo certificate for:', certificateId)
          setCertificate({
            id: certificateId,
            user_id: 'demo-user-id',
            course_title: 'Forklift Operator Safety Training',
            completed_at: new Date().toISOString(),
            operator_name: 'Demo Operator (Test Certificate)'
          })
          setLoading(false)
          return
        }
        
        throw error
      }
      
      let courseTitle = 'Unknown Course'
      if (enrollment?.course_id) {
        const { data: course } = await supabase
          .from('courses')
          .select('title')
          .eq('id', enrollment.course_id)
          .single()
        courseTitle = course?.title || 'Unknown Course'
      }

      if (!enrollment) {
        console.log('❌ No enrollment found for certificate ID:', certificateId)
        setError('Certificate not found')
        return
      }

      // Get user name
      const { data: userData } = await supabase
        .auth.admin.getUserById(enrollment.user_id)

      const operatorName = userData?.user?.user_metadata?.full_name || 
                          userData?.user?.email || 
                          'Unknown Operator'

      console.log('✅ Certificate data loaded:', {
        id: enrollment.id,
        operatorName,
        courseTitle
      })

      setCertificate({
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_title: courseTitle,
        completed_at: enrollment.created_at,
        operator_name: operatorName
      })
    } catch (error) {
      console.error('❌ Certificate fetch error:', error)
      setError(`Failed to load certificate data: ${error instanceof Error ? error.message : 'Database connection issue'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckChange = (skillId: string, value: 'pass' | 'retrain') => {
    setChecks(prev => ({
      ...prev,
      [skillId]: value
    }))
  }

  const handleSubmit = async () => {
    if (!certificate || !supervisorEmail) return

    setSubmitting(true)
    try {
      const result = await uploadEval({
        certificateId: certificate.id,
        supervisorEmail,
        equipmentType,
        checks,
        signature: signature || { type: 'typed', data: '' }
      })

      if (result.success) {
        // Call email API
        await fetch('/api/email-eval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data)
        })

        // Show success and redirect
        alert('Evaluation submitted successfully!')
        router.push('/')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit evaluation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading evaluation...</p>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">Evaluation Not Available</h1>
          <p className="text-red-600">{error || 'Certificate not found'}</p>
          <a
            href="/"
            className="mt-4 inline-block bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  const isStepComplete = (stepNum: number) => {
    switch (stepNum) {
      case 1: return equipmentType.trim() !== ''
      case 2: return Object.keys(checks).length === EVALUATION_SKILLS.length
      case 3: return signature && signature.data !== ''
      case 4: return supervisorEmail.trim() !== ''
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          {certificate.operator_name.includes('Demo Operator') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800 font-medium">Demo Mode</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                This is a demo evaluation for testing purposes. Certificate ID: {certificateId}
              </p>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supervisor Evaluation Wizard
          </h1>
          <p className="text-gray-600">
            Complete the OSHA-required practical evaluation for <strong>{certificate.operator_name}</strong>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  i <= step
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-teal-800">
                Step 1: Operator & Equipment Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operator Name
                  </label>
                  <input
                    type="text"
                    value={certificate.operator_name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Equipment Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                    {[
                      { 
                        id: 'sit-down-forklift', 
                        name: 'Sit-Down Forklift', 
                        icon: '🚜',
                        description: 'Counterbalance forklift'
                      },
                      { 
                        id: 'stand-up-forklift', 
                        name: 'Stand-Up Forklift', 
                        icon: '🧍',
                        description: 'Stand-up counterbalance'
                      },
                      { 
                        id: 'reach-truck', 
                        name: 'Reach Truck', 
                        icon: '📏',
                        description: 'Pantograph reach'
                      },
                      { 
                        id: 'order-picker', 
                        name: 'Order Picker', 
                        icon: '📦',
                        description: 'Vertical order selector'
                      },
                      { 
                        id: 'pallet-truck', 
                        name: 'Pallet Truck', 
                        icon: '🛒',
                        description: 'Motorized pallet jack'
                      },
                      { 
                        id: 'telehandler', 
                        name: 'Telehandler', 
                        icon: '🏗️',
                        description: 'Telescopic handler'
                      },
                      { 
                        id: 'side-loader', 
                        name: 'Side Loader', 
                        icon: '↔️',
                        description: 'Side loading forklift'
                      },
                      { 
                        id: 'narrow-aisle', 
                        name: 'Narrow Aisle', 
                        icon: '🎯',
                        description: 'VNA/turret truck'
                      }
                    ].map((equipment) => (
                      <button
                        key={equipment.id}
                        type="button"
                        onClick={() => setEquipmentType(equipment.name)}
                        className={`p-4 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                          equipmentType === equipment.name
                            ? 'border-orange-500 bg-orange-50 text-orange-800'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{equipment.icon}</div>
                        <div className="text-sm font-medium">{equipment.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{equipment.description}</div>
                      </button>
                    ))}
                  </div>
                  
                  {equipmentType && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specific Model/Serial (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Toyota 8FGCU25, Crown PE4500, Serial #12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Add specific model number or serial if needed for documentation
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Selected:</strong> {equipmentType || 'Please select equipment type above'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Completed
                  </label>
                  <input
                    type="text"
                    value={certificate.course_title}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-teal-800">
                Step 2: Skill Assessment Checklist
              </h2>
              <p className="text-gray-600 mb-6">
                Evaluate each skill based on OSHA 29 CFR 1910.178 requirements:
              </p>
              <div className="space-y-4">
                {EVALUATION_SKILLS.map((skill) => (
                  <div
                    key={skill.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      checks[skill.id] === 'pass'
                        ? 'border-emerald-500 bg-emerald-50'
                        : checks[skill.id] === 'retrain'
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{skill.label}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCheckChange(skill.id, 'pass')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            checks[skill.id] === 'pass'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'
                          }`}
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => handleCheckChange(skill.id, 'retrain')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            checks[skill.id] === 'retrain'
                              ? 'bg-rose-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-rose-100'
                          }`}
                        >
                          Retrain
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-teal-800">
                Step 3: Evaluator Signature
              </h2>
              <p className="text-gray-600 mb-6">
                Sign digitally to certify this evaluation per OSHA 29 CFR 1910.178(m):
              </p>
              <EvalSignature
                onSignatureChange={setSignature}
                value={signature}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-teal-800">
                Step 4: Review & Submit
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    value={supervisorEmail}
                    onChange={(e) => setSupervisorEmail(e.target.value)}
                    placeholder="supervisor@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You'll receive a copy of the completed evaluation
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Evaluation Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Operator:</strong> {certificate.operator_name}</p>
                    <p><strong>Equipment:</strong> {equipmentType}</p>
                    <p><strong>Skills Assessed:</strong> {Object.keys(checks).length} of {EVALUATION_SKILLS.length}</p>
                    <p><strong>Passed:</strong> {Object.values(checks).filter(v => v === 'pass').length}</p>
                    <p><strong>Needs Retraining:</strong> {Object.values(checks).filter(v => v === 'retrain').length}</p>
                    <p><strong>Signature:</strong> {signature?.data ? 'Provided' : 'Missing'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!isStepComplete(step)}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepComplete(4) || submitting}
              className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          )}
        </div>

        {/* Fallback Link */}
        <div className="mt-8 text-center border-t pt-6">
          <p className="text-sm text-gray-600 mb-2">
            Need to use a paper form instead?
          </p>
          <a
            href="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/NEW-branded-eval.pdf"
            className="text-sm text-orange-600 hover:text-orange-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Branded PDF
          </a>
        </div>
      </div>
    </div>
  )
} 