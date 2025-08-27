import { supabaseBrowser } from '@/lib/supabase/client'

const supabase = supabaseBrowser

export interface EvalSubmissionData {
  certificateId: string
  supervisorEmail: string
  equipmentType: string
  checks: Record<string, 'pass' | 'retrain'>
  signature: { type: 'typed' | 'drawn', data: string }
}

export async function uploadEval(data: EvalSubmissionData) {
  try {
    let signatureUrl = ''
    
    // Upload signature if provided
    if (data.signature.data) {
      console.log('📝 Attempting to upload signature...')
      
      // For now, skip actual file upload and just store signature data as text
      // This bypasses the RLS policy issue temporarily
      console.log('⚠️ Temporarily skipping file upload due to RLS policies')
      signatureUrl = `data:${data.signature.type === 'typed' ? 'image/svg+xml' : 'image/png'};base64,${data.signature.data}`
      
      // TODO: Uncomment this section once storage policies are fixed
      /*
      const timestamp = Date.now()
      const fileName = `eval-signature-${data.certificateId}-${timestamp}`
      
      let fileContent: Blob
      let contentType: string
      
      if (data.signature.type === 'typed') {
        // Convert SVG string to blob
        fileContent = new Blob([data.signature.data], { type: 'image/svg+xml' })
        contentType = 'image/svg+xml'
      } else {
        // Convert base64 data URL to blob
        const base64Data = data.signature.data.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        fileContent = new Blob([byteArray], { type: 'image/png' })
        contentType = 'image/png'
      }
      
      const fileExtension = data.signature.type === 'typed' ? 'svg' : 'png'
      const fullFileName = `signatures/${fileName}.${fileExtension}`
      
      // Upload signature to Supabase storage (using site-assets bucket which is public)
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('site-assets')
        .upload(fullFileName, fileContent, {
          contentType,
          upsert: false
        })
      
      if (uploadError) {
        throw new Error(`Signature upload failed: ${uploadError.message}`)
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('site-assets')
        .getPublicUrl(fullFileName)
      
      signatureUrl = publicUrl
      */
    }
    
    // Insert evaluation submission
    const { data: submission, error: insertError } = await supabase
      .from('eval_submissions')
      .insert({
        certificate_id: data.certificateId,
        supervisor_email: data.supervisorEmail,
        equipment_type: data.equipmentType,
        checks_json: data.checks,
        signature_url: signatureUrl
      })
      .select()
      .single()
    
    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`)
    }
    
    return { success: true, data: submission }
  } catch (error) {
    console.error('Evaluation upload error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
} 