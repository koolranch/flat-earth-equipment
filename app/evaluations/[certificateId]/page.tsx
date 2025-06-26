'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import EvalSignature from '@/components/EvalSignature'
import { uploadEval } from '@/utils/uploadEval'
import { Truck, User, Maximize2, Package, ShoppingCart } from 'lucide-react'

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

// Translation strings
const translations = {
  en: {
    title: 'Supervisor Evaluation Wizard',
    subtitle: 'Complete the OSHA-required practical evaluation for',
    demoMode: 'Demo Mode',
    demoDescription: 'This is a demo evaluation for testing purposes. Certificate ID:',
    loading: 'Loading evaluation...',
    errorTitle: 'Evaluation Not Available',
    errorReturn: 'Return Home',
    steps: {
      setup: 'Setup',
      assess: 'Assess', 
      sign: 'Sign',
      submit: 'Submit'
    },
    step1: {
      title: 'Step 1: Operator & Equipment Information',
      operatorName: 'Operator Name',
      equipmentType: 'Equipment Type *',
      equipmentTypes: {
        'Sit-Down Forklift': { name: 'Sit-Down Forklift', description: 'Counterbalance forklift' },
        'Stand-Up Forklift': { name: 'Stand-Up Forklift', description: 'Stand-up counterbalance' },
        'Reach Truck': { name: 'Reach Truck', description: 'Pantograph reach' },
        'Order Picker': { name: 'Order Picker', description: 'Vertical order selector' },
        'Pallet Truck': { name: 'Pallet Truck', description: 'Motorized pallet jack' }
      },
      modelSerial: 'Specific Model or Asset Number',
      modelPlaceholder: 'e.g., Toyota 8FGCU25, Crown PE4500, Serial #12345',
      modelHelp: 'Add specific model number or serial if needed for documentation',
      selected: 'Selected:',
      selectPrompt: 'Please select equipment type above',
      courseCompleted: 'Course Completed'
    },
    step2: {
      title: 'Step 2: Skill Assessment Checklist',
      subtitle: 'Evaluate each skill based on OSHA 29 CFR 1910.178 requirements:',
      pass: '✓ Pass',
      retrain: '⚠️ Retrain',
      progress: 'Progress:',
      completed: 'completed'
    },
    step3: {
      title: 'Step 3: Evaluator Signature',
      subtitle: 'Sign digitally to certify this evaluation per OSHA 29 CFR 1910.178(m):'
    },
    step4: {
      title: 'Step 4: Review & Submit',
      emailLabel: 'Your Email Address *',
      emailPlaceholder: 'supervisor@company.com',
      emailHelp: 'You\'ll receive a copy of the completed evaluation',
      summaryTitle: 'Evaluation Summary',
      operator: 'Operator:',
      equipment: 'Equipment:',
      skillsAssessed: 'Skills Assessed:',
      passed: 'Passed:',
      needsRetraining: 'Needs Retraining:',
      signature: 'Signature:',
      provided: '✅ Provided',
      missing: '❌ Missing'
    },
    navigation: {
      previous: '← Previous',
      next: 'Next →',
      submitting: '⏳ Submitting...',
      submit: '✅ Submit Evaluation'
    },
    fallback: {
      title: 'Need to use a paper form instead?',
      download: '📄 Download Printable Evaluation Form'
    },
    skills: {
      'pre_fluid': 'Fluid levels, tires, forks, mast, devices',
      'pre_belt': 'Seatbelt usage',
      'op_mount': 'Mount / Dismount (3-point)',
      'op_load': 'Load handling & tilt back',
      'op_speed': 'Travel speed ≤ 5 mph',
      'op_horn': 'Horn at intersections',
      'op_ped': 'Pedestrian awareness',
      'op_ramp': 'Ramp parking technique',
      'park_proc': 'Parking procedure',
      'op_control': 'Overall smooth control'
    },
    messages: {
      submitSuccess: 'Evaluation submitted successfully!',
      emailSent: 'Email notification sent to supervisor.',
      submitError: 'Failed to submit evaluation:'
    }
  },
  es: {
    title: 'Asistente de Evaluación del Supervisor',
    subtitle: 'Complete la evaluación práctica requerida por OSHA para',
    demoMode: 'Modo Demo',
    demoDescription: 'Esta es una evaluación de demostración para propósitos de prueba. ID del Certificado:',
    loading: 'Cargando evaluación...',
    errorTitle: 'Evaluación No Disponible',
    errorReturn: 'Regresar al Inicio',
    steps: {
      setup: 'Configurar',
      assess: 'Evaluar',
      sign: 'Firmar',
      submit: 'Enviar'
    },
    step1: {
      title: 'Paso 1: Información del Operador y Equipo',
      operatorName: 'Nombre del Operador',
      equipmentType: 'Tipo de Equipo *',
      equipmentTypes: {
        'Sit-Down Forklift': { name: 'Montacargas Sentado', description: 'Montacargas de contrapeso' },
        'Stand-Up Forklift': { name: 'Montacargas de Pie', description: 'Contrapeso de pie' },
        'Reach Truck': { name: 'Reach Truck', description: 'Alcance pantógrafo' },
        'Order Picker': { name: 'Selector de Pedidos', description: 'Selector vertical de pedidos' },
        'Pallet Truck': { name: 'Transpaleta', description: 'Gato hidráulico motorizado' }
      },
      modelSerial: 'Modelo Específico o Número de Activo',
      modelPlaceholder: 'ej., Toyota 8FGCU25, Crown PE4500, Serie #12345',
      modelHelp: 'Agregue el número de modelo específico o serie si es necesario para la documentación',
      selected: 'Seleccionado:',
      selectPrompt: 'Por favor seleccione el tipo de equipo arriba',
      courseCompleted: 'Curso Completado'
    },
    step2: {
      title: 'Paso 2: Lista de Verificación de Evaluación de Habilidades',
      subtitle: 'Evalúe cada habilidad basada en los requisitos de OSHA 29 CFR 1910.178:',
      pass: '✓ Aprobado',
      retrain: '⚠️ Reentrenar',
      progress: 'Progreso:',
      completed: 'completado'
    },
    step3: {
      title: 'Paso 3: Firma del Evaluador',
      subtitle: 'Firme digitalmente para certificar esta evaluación según OSHA 29 CFR 1910.178(m):'
    },
    step4: {
      title: 'Paso 4: Revisar y Enviar',
      emailLabel: 'Su Dirección de Correo Electrónico *',
      emailPlaceholder: 'supervisor@empresa.com',
      emailHelp: 'Recibirá una copia de la evaluación completada',
      summaryTitle: 'Resumen de la Evaluación',
      operator: 'Operador:',
      equipment: 'Equipo:',
      skillsAssessed: 'Habilidades Evaluadas:',
      passed: 'Aprobadas:',
      needsRetraining: 'Necesita Reentrenamiento:',
      signature: 'Firma:',
      provided: '✅ Proporcionada',
      missing: '❌ Faltante'
    },
    navigation: {
      previous: '← Anterior',
      next: 'Siguiente →',
      submitting: '⏳ Enviando...',
      submit: '✅ Enviar Evaluación'
    },
    fallback: {
      title: '¿Necesita usar un formulario en papel?',
      download: '📄 Descargar Formulario de Evaluación Imprimible'
    },
    skills: {
      'pre_fluid': 'Niveles de fluidos, llantas, horquillas, mástil, dispositivos',
      'pre_belt': 'Uso del cinturón de seguridad',
      'op_mount': 'Subir / Bajar (3 puntos)',
      'op_load': 'Manejo de carga e inclinación hacia atrás',
      'op_speed': 'Velocidad de viaje ≤ 8 km/h',
      'op_horn': 'Claxon en intersecciones',
      'op_ped': 'Conciencia peatonal',
      'op_ramp': 'Técnica de estacionamiento en rampa',
      'park_proc': 'Procedimiento de estacionamiento',
      'op_control': 'Control suave general'
    },
    messages: {
      submitSuccess: '¡Evaluación enviada exitosamente!',
      emailSent: 'Notificación por correo electrónico enviada al supervisor.',
      submitError: 'Error al enviar la evaluación:'
    }
  }
}

const EVALUATION_SKILLS = [
  { id: 'pre_fluid', labelKey: 'pre_fluid' },
  { id: 'pre_belt', labelKey: 'pre_belt' },
  { id: 'op_mount', labelKey: 'op_mount' },
  { id: 'op_load', labelKey: 'op_load' },
  { id: 'op_speed', labelKey: 'op_speed' },
  { id: 'op_horn', labelKey: 'op_horn' },
  { id: 'op_ped', labelKey: 'op_ped' },
  { id: 'op_ramp', labelKey: 'op_ramp' },
  { id: 'park_proc', labelKey: 'park_proc' },
  { id: 'op_control', labelKey: 'op_control' }
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
  const [language, setLanguage] = useState<'en' | 'es'>('en')
  
  // Form data
  const [equipmentType, setEquipmentType] = useState('')
  const [checks, setChecks] = useState<EvaluationChecks>({})
  const [signature, setSignature] = useState<{ type: 'typed' | 'drawn', data: string } | null>(null)
  const [supervisorEmail, setSupervisorEmail] = useState('')

  // Get current translations
  const t = translations[language]

  useEffect(() => {
    // Detect language from browser or URL
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('es')) {
      setLanguage('es')
    }
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
          course_title: language === 'es' ? 'Entrenamiento de Seguridad para Operador de Montacargas' : 'Forklift Operator Safety Training',
          completed_at: new Date().toISOString(),
          operator_name: language === 'es' ? 'Operador Demo (Certificado de Prueba)' : 'Demo Operator (Test Certificate)'
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
            course_title: language === 'es' ? 'Entrenamiento de Seguridad para Operador de Montacargas' : 'Forklift Operator Safety Training',
            completed_at: new Date().toISOString(),
            operator_name: language === 'es' ? 'Operador Demo (Certificado de Prueba)' : 'Demo Operator (Test Certificate)'
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
      console.log('🚀 Starting evaluation submission...')
      console.log('📋 Submission data:', {
        certificateId: certificate.id,
        supervisorEmail,
        equipmentType,
        checksCount: Object.keys(checks).length,
        hasSignature: !!(signature && signature.data)
      })

      const result = await uploadEval({
        certificateId: certificate.id,
        supervisorEmail,
        equipmentType,
        checks,
        signature: signature || { type: 'typed', data: '' }
      })

      console.log('📤 Upload result:', result)

      if (result.success) {
        console.log('✅ Upload successful, sending email...')
        
        // Call email API
        const emailResponse = await fetch('/api/email-eval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data)
        })

        console.log('📧 Email response status:', emailResponse.status)
        
        if (!emailResponse.ok) {
          const emailError = await emailResponse.text()
          console.error('❌ Email API error:', emailError)
          throw new Error(`Email failed: ${emailError}`)
        }

        // Show success with detailed message
        const emailData = await emailResponse.json()
        alert(`${t.messages.submitSuccess}\n\n${t.step4.operator} ${emailData.status || 'Completed'}\n${t.step4.skillsAssessed} ${emailData.score || 'N/A'}\n\n${t.messages.emailSent}`)
        router.push('/')
      } else {
        console.error('❌ Upload failed:', result.error)
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('💥 Submission error:', error)
      alert(`${t.messages.submitError} ${error instanceof Error ? error.message : 'Unknown error'}. Please check console for details.`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t.loading}</p>
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
          <h1 className="text-2xl font-bold text-red-700 mb-2">{t.errorTitle}</h1>
          <p className="text-red-600">{error || 'Certificate not found'}</p>
          <a
            href="/"
            className="mt-4 inline-block bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
          >
            {t.errorReturn}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === 'en' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === 'es' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Español
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          {certificate.operator_name.includes('Demo Operator') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800 font-medium">Demo Mode</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                {t.demoDescription} {certificateId}
              </p>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base px-2">
            {t.subtitle} <strong>{certificate.operator_name}</strong>
          </p>
        </div>

        {/* Progress Bar - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium mb-1 ${
                    i <= step
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i}
                </div>
                <span className={`text-xs font-medium ${
                  i <= step ? 'text-orange-600' : 'text-gray-400'
                }`}>
                  {i === 1 ? t.steps.setup : i === 2 ? t.steps.assess : i === 3 ? t.steps.sign : t.steps.submit}
                </span>
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

        {/* Step Content - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          {step === 1 && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-teal-800">
                {t.step1.title}
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.step1.operatorName}
                  </label>
                  <input
                    type="text"
                    value={certificate.operator_name}
                    disabled
                    className="w-full px-3 py-3 text-base border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t.step1.equipmentType}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {[
                      { 
                        id: 'sit-down-forklift', 
                        key: 'Sit-Down Forklift',
                        IconComponent: Truck,
                        iconColor: 'text-orange-600'
                      },
                      { 
                        id: 'stand-up-forklift', 
                        key: 'Stand-Up Forklift',
                        IconComponent: User,
                        iconColor: 'text-blue-600'
                      },
                      { 
                        id: 'reach-truck', 
                        key: 'Reach Truck',
                        IconComponent: Maximize2,
                        iconColor: 'text-green-600'
                      },
                      { 
                        id: 'order-picker', 
                        key: 'Order Picker',
                        IconComponent: Package,
                        iconColor: 'text-purple-600'
                      },
                      { 
                        id: 'pallet-truck', 
                        key: 'Pallet Truck',
                        IconComponent: ShoppingCart,
                        iconColor: 'text-teal-600'
                      }
                    ].map((equipment) => (
                      <button
                        key={equipment.id}
                        type="button"
                        onClick={() => setEquipmentType(t.step1.equipmentTypes[equipment.key as keyof typeof t.step1.equipmentTypes]?.name || equipment.key)}
                        className={`p-4 border-2 rounded-lg text-center transition-all hover:shadow-md touch-manipulation ${
                          equipmentType === (t.step1.equipmentTypes[equipment.key as keyof typeof t.step1.equipmentTypes]?.name || equipment.key)
                            ? 'border-orange-500 bg-orange-50 text-orange-800'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="mb-2">
                          <equipment.IconComponent 
                            className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto ${equipment.iconColor}`}
                          />
                        </div>
                        <div className="text-sm font-medium">
                          {t.step1.equipmentTypes[equipment.key as keyof typeof t.step1.equipmentTypes]?.name || equipment.key}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {t.step1.equipmentTypes[equipment.key as keyof typeof t.step1.equipmentTypes]?.description || ''}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {equipmentType && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.step1.modelSerial}
                      </label>
                      <input
                        type="text"
                        placeholder={t.step1.modelPlaceholder}
                        className="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        {t.step1.modelHelp}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {t.step1.selected} {equipmentType || t.step1.selectPrompt}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.step1.courseCompleted}
                  </label>
                  <input
                    type="text"
                    value={certificate.course_title}
                    disabled
                    className="w-full px-3 py-3 text-base border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-teal-800">
                {t.step2.title}
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                {t.step2.subtitle}
              </p>
              <div className="space-y-3 sm:space-y-4">
                {EVALUATION_SKILLS.map((skill) => (
                  <div
                    key={skill.id}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                      checks[skill.id] === 'pass'
                        ? 'border-emerald-500 bg-emerald-50'
                        : checks[skill.id] === 'retrain'
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                              <span className="font-medium text-gray-900 text-sm sm:text-base leading-relaxed">
                         {t.skills[skill.id as keyof typeof t.skills]}
                        </span>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <button
                          onClick={() => handleCheckChange(skill.id, 'pass')}
                          className={`flex-1 sm:flex-none px-4 py-3 rounded-md text-sm font-medium transition-colors touch-manipulation ${
                            checks[skill.id] === 'pass'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'
                          }`}
                        >
                          {t.step2.pass}
                        </button>
                        <button
                          onClick={() => handleCheckChange(skill.id, 'retrain')}
                          className={`flex-1 sm:flex-none px-4 py-3 rounded-md text-sm font-medium transition-colors touch-manipulation ${
                            checks[skill.id] === 'retrain'
                              ? 'bg-rose-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-rose-100'
                          }`}
                        >
                          {t.step2.retrain}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Progress indicator for mobile */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {t.step2.progress}
                  </span>
                  <span className={`font-medium ${
                    Object.keys(checks).length === EVALUATION_SKILLS.length 
                      ? 'text-green-600' 
                      : 'text-orange-600'
                  }`}>
                    {Object.keys(checks).length} of {EVALUATION_SKILLS.length} {t.step2.completed}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-teal-800">
                {t.step3.title}
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                {t.step3.subtitle}
              </p>
              <EvalSignature
                onSignatureChange={setSignature}
                value={signature}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-teal-800">
                {t.step4.title}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.step4.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={supervisorEmail}
                    onChange={(e) => setSupervisorEmail(e.target.value)}
                    placeholder={t.step4.emailPlaceholder}
                    className="w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {t.step4.emailHelp}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3 text-lg">
                    {t.step4.summaryTitle}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {t.step4.operator}
                      </span>
                      <span className="text-right">{certificate.operator_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {t.step4.equipment}
                      </span>
                      <span className="text-right">{equipmentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {t.step4.skillsAssessed}
                      </span>
                      <span className="text-right">{Object.keys(checks).length} of {EVALUATION_SKILLS.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-green-700">
                        {t.step4.passed}
                      </span>
                      <span className="text-right font-medium text-green-700">{Object.values(checks).filter(v => v === 'pass').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-red-700">
                        {t.step4.needsRetraining}
                      </span>
                      <span className="text-right font-medium text-red-700">{Object.values(checks).filter(v => v === 'retrain').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {t.step4.signature}
                      </span>
                      <span className={`text-right font-medium ${signature?.data ? 'text-green-700' : 'text-red-700'}`}>
                        {signature?.data ? t.step4.provided : t.step4.missing}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {t.navigation.previous}
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!isStepComplete(step)}
              className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {t.navigation.next}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepComplete(4) || submitting}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {t.navigation.submitting}
            </button>
          )}
        </div>

        {/* Fallback Link - Mobile Optimized */}
        <div className="mt-8 text-center border-t pt-6">
          <p className="text-sm text-gray-600 mb-3">
            {t.fallback.title}
          </p>
          <a
                            href="/pdfs/forklift-evaluation-form-v2.4.pdf"
            className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 underline touch-manipulation"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.fallback.download}
          </a>
        </div>
      </div>
    </div>
  )
} 