import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

async function createPromotionCode() {
  try {
    console.log('🎟️ Creating promotion code for TEST-FORKLIFT-100 coupon...')
    
    // First, verify the coupon exists
    const coupon = await stripe.coupons.retrieve('TEST-FORKLIFT-100')
    console.log('✅ Found coupon:', coupon.id)
    console.log(`   - Coupon max redemptions: ${coupon.max_redemptions}`)
    
    // Create the promotion code (inherit redemption limits from coupon)
    const promotionCode = await stripe.promotionCodes.create({
      coupon: 'TEST-FORKLIFT-100',
      code: 'TEST-FORKLIFT-100',
      active: true,
      restrictions: {
        first_time_transaction: false,
      }
    })
    
    console.log('✅ Promotion code created successfully!')
    console.log('📋 Promotion Code Details:')
    console.log(`   - Code: ${promotionCode.code}`)
    console.log(`   - Active: ${promotionCode.active}`)
    console.log(`   - Times Used: ${promotionCode.times_redeemed}`)
    console.log(`   - Coupon: ${promotionCode.coupon}`)
    
    console.log('\n🚀 Ready to test!')
    console.log('💡 Go to Stripe checkout and enter: TEST-FORKLIFT-100')
    console.log('🎯 Should now work in the "Add promotion code" field!')
    
  } catch (error: any) {
    if (error.code === 'resource_already_exists') {
      console.log('✅ Promotion code already exists!')
      
      // List existing promotion codes to verify
      const promotionCodes = await stripe.promotionCodes.list({
        code: 'TEST-FORKLIFT-100',
        limit: 1
      })
      
      if (promotionCodes.data.length > 0) {
        const existing = promotionCodes.data[0]
        console.log('📋 Existing promotion code:')
        console.log(`   - Code: ${existing.code}`)
        console.log(`   - Active: ${existing.active}`)
        console.log(`   - Times Used: ${existing.times_redeemed}`)
      }
      
      console.log('💡 Code should work in Stripe checkout now!')
    } else {
      console.error('❌ Error creating promotion code:', error.message)
      console.log('\n🔧 Debug info:')
      console.log('   - Make sure the coupon TEST-FORKLIFT-100 exists')
      console.log('   - Check if promotion code already exists with different settings')
    }
  }
}

createPromotionCode() 