import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Verify({ params }: { params: { certId: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      }
    }
  )
  
  // Find enrollment by certificate URL pattern
  const certUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certs/${params.certId}.pdf`
  
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select(`
      cert_url, 
      expires_at, 
      passed,
      user_id,
      course_id
    `)
    .eq('cert_url', certUrl)
    .single()

  if (!enrollment || !enrollment.passed) {
    return (
      <div className="min-h-screen bg-gray-50 grid place-content-center">
        <div className="mx-auto max-w-xl rounded-lg border border-red-200 bg-red-50 p-8 text-center shadow">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-red-700">Certificate Not Found</h1>
          <p className="text-red-600">This certificate ID is invalid or does not exist.</p>
        </div>
      </div>
    )
  }
  
  // Get user and course data separately
  const { data: userData } = await supabase.auth.admin.getUserById(enrollment.user_id)
  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('id', enrollment.course_id)
    .single()
  
  const isExpired = enrollment.expires_at && new Date(enrollment.expires_at) < new Date()
  
  return (
    <div className="min-h-screen bg-gray-50 grid place-content-center">
      <div className="mx-auto max-w-xl rounded-lg border p-8 text-center shadow bg-white">
        {!isExpired ? (
          <>
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="mb-4 text-2xl font-bold text-green-700">Certificate Valid ✅</h1>
            <div className="space-y-2 text-left">
              <p><strong>Certificate ID:</strong> {params.certId}</p>
              <p><strong>Holder:</strong> {userData?.user?.email || 'Unknown'}</p>
              <p><strong>Course:</strong> {course?.title || 'Unknown'}</p>
              <p><strong>Expires:</strong> {new Date(enrollment.expires_at).toLocaleDateString()}</p>
            </div>
            <a 
              href={enrollment.cert_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded bg-orange-600 px-6 py-2 font-medium text-white hover:bg-orange-700"
            >
              View Certificate
            </a>
          </>
        ) : (
          <>
            <div className="text-yellow-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="mb-4 text-2xl font-bold text-yellow-700">Certificate Expired</h1>
            <p className="text-gray-600">This certificate expired on {new Date(enrollment.expires_at).toLocaleDateString()}</p>
          </>
        )}
      </div>
    </div>
  )
} 