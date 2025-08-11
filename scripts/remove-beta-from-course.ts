import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function removeBetaFromCourse() {
  try {
    console.log('🎯 Removing BETA from forklift course...')
    
    // 1. Update database course
    console.log('📄 Updating database course...')
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .update({ 
        title: 'Online Forklift Operator Certification',
        description: 'Complete OSHA-compliant forklift safety training with interactive demos and assessment.'
      })
      .eq('slug', 'forklift')
      .select()
    
    if (courseError) {
      console.error('❌ Database update failed:', courseError)
      return
    }
    
    console.log('✅ Database course updated:', courseData?.[0]?.title)
    
    // 2. Find and update Stripe product
    console.log('💳 Finding Stripe product...')
    const products = await stripe.products.list({ 
      active: true,
      limit: 100 
    })
    
    const forkliftProduct = products.data.find(p => 
      p.name?.includes('Forklift') || 
      p.description?.includes('forklift') ||
      p.description?.includes('BETA')
    )
    
    if (!forkliftProduct) {
      console.log('⚠️ No forklift product found in Stripe')
      return
    }
    
    console.log('📋 Found product:', forkliftProduct.name)
    console.log('📋 Current description:', forkliftProduct.description)
    
    // Update Stripe product
    const updatedProduct = await stripe.products.update(forkliftProduct.id, {
      name: 'Online Forklift Operator Certification',
      description: 'Complete OSHA-compliant forklift safety training with interactive demos and assessment. Earn your certification in under 90 minutes.',
      metadata: {
        course_slug: 'forklift',
        updated: new Date().toISOString(),
        status: 'production'
      }
    })
    
    console.log('✅ Stripe product updated!')
    console.log('📋 New name:', updatedProduct.name)
    console.log('📋 New description:', updatedProduct.description)
    
    console.log('🎉 Course is now production-ready!')
    
  } catch (error) {
    console.error('❌ Error updating course:', error)
  }
}

removeBetaFromCourse() 