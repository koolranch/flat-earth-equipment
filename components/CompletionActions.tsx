'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Modal from '@/components/ui/Modal'

interface CompletionActionsProps {
  certificateUrl: string
  courseId: string
  user: any
  enrollmentId?: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CompletionActions({ certificateUrl, courseId, user, enrollmentId }: CompletionActionsProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  // Extract certificate ID from URL for the evaluation wizard
  const getCertificateId = () => {
    // Use enrollmentId if provided, otherwise try to extract from certificate URL
    if (enrollmentId) return enrollmentId
    
    // Extract cert ID from URL pattern like /storage/.../certs/ABC123-en.pdf
    const urlMatch = certificateUrl.match(/certs\/([A-Z0-9]+)(-[a-z]{2})?\.pdf/)
    if (urlMatch) {
      return urlMatch[1] // Return the cert ID part
    }
    
    // Fallback to courseId (not ideal but better than nothing)
    return courseId
  }

  async function handleSend() {
    if (!email) return
    
    setSending(true)
    
    try {
      console.log('📧 Starting email send process...', { 
        email, 
        userId: user.id, 
        courseId, 
        certificateUrl 
      });
      
      // 1. Try to store the share record first using API endpoint
      console.log('📝 Attempting database insert via API...');
      try {
        const shareResponse = await fetch('/api/record-training-share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            courseId: courseId,
            supervisorEmail: email,
          }),
        });
        
        const shareResult = await shareResponse.json();
        
        if (shareResponse.ok) {
          console.log('✅ Database insert successful:', shareResult);
        } else {
          console.error('❌ Database insert failed:', shareResult);
          console.log('⚠️ Continuing with email send despite database error...');
        }
      } catch (shareError) {
        console.error('❌ Database insert request failed:', shareError);
        console.log('⚠️ Continuing with email send despite database error...');
      }
      
      // 2. Send email via our API endpoint (always attempt this)
      console.log('📧 Attempting email send...');
      const response = await fetch('/api/send-certificate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          certificateUrl,
          studentName: user.user_metadata?.full_name || user.email,
          enrollmentId: getCertificateId(), // Include enrollment ID for digital evaluation wizard
        }),
      })
      
      const emailResult = await response.json();
      console.log('📧 Email API response:', emailResult);
      
      if (!response.ok) {
        console.error('❌ Email API failed:', emailResult);
        throw new Error(`Email sending failed: ${emailResult.error || 'Unknown error'}`);
      }
      
      console.log('✅ Email sent successfully!');
      setSuccess(true)
      setEmail('')
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error in email send process:', error)
      
      // Show more specific error message
      let errorMessage = 'Failed to send email. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Digital Evaluation Option */}
      <div className="bg-gradient-to-r from-teal-50 to-orange-50 border border-teal-200 rounded-lg p-4">
        <h3 className="font-semibold text-teal-800 mb-2">
          📱 Complete Supervisor Evaluation →
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Mobile-first digital evaluation wizard with electronic signatures
        </p>
        <a
          href={`/evaluations/${getCertificateId()}`}
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors"
        >
          Start Digital Evaluation
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7h10l-4 4v6" />
          </svg>
        </a>
      </div>

      {/* Traditional Options */}
      <div className="flex flex-col sm:flex-row gap-4">
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
      </div>

      {/* Fallback PDF Link */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-600 mb-2">
          Need paper copy? 
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
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>🎯 New Digital Option Available!</strong>
              </p>
              <p className="text-xs text-blue-700">
                Supervisors can now complete evaluations digitally with our mobile-first wizard.
              </p>
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