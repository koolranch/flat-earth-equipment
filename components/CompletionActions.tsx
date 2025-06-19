'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Modal from '@/components/ui/Modal'

interface CompletionActionsProps {
  certificateUrl: string
  courseId: string
  user: any
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CompletionActions({ certificateUrl, courseId, user }: CompletionActionsProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSend() {
    if (!email) return
    
    setSending(true)
    
    try {
      // 1. Store the share record
      await supabase.from('training_shares').insert({
        user_id: user.id,
        course_id: courseId,
        supervisor_email: email,
      })
      
      // 2. Send email via our API endpoint
      const response = await fetch('/api/send-certificate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          certificateUrl,
          studentName: user.user_metadata?.full_name || user.email,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to send email')
      }
      
      setSuccess(true)
      setEmail('')
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 2000)
      
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <a
        href={certificateUrl}
        className="bg-orange-600 text-white px-6 py-3 rounded text-center hover:bg-orange-700 transition-colors"
        download
      >
        📜 Download Certificate
      </a>

      <button
        onClick={() => setOpen(true)}
        className="bg-slate-700 text-white px-6 py-3 rounded text-center hover:bg-slate-800 transition-colors"
      >
        📧 Send Training Documents to Supervisor
      </button>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        {success ? (
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-green-800 mb-2">Documents Sent Successfully!</h2>
            <p className="text-green-700">Your supervisor will receive both your certificate and the evaluation form.</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">Send Training Documents to Supervisor</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Your supervisor will receive your completion certificate and the employer evaluation form to complete your OSHA training requirements.
            </p>
            
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Supervisor's Email Address</span>
              <input
                type="email"
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="supervisor@company.com"
                required
              />
            </label>
            
            <div className="mb-4 text-xs text-gray-500">
              <p className="mb-1">Documents that will be sent:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your completion certificate (PDF)</li>
                <li>Employer evaluation checklist (fillable PDF)</li>
                <li>OSHA compliance requirements</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                disabled={sending || !email}
                onClick={handleSend}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Documents'
                )}
              </button>
              
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
} 