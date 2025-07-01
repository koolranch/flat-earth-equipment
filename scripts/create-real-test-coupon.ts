import Stripe from 'stripe'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

async function createRealTestCoupon() {
  try {
    console.log('🎟️ Creating $58 off coupon for real purchase testing...')
    
    const coupon = await stripe.coupons.create({
      id: 'REAL-TEST-58OFF',
      amount_off: 5800, // $58.00 in cents
      currency: 'usd',
      duration: 'once',
      name: 'Real Purchase Test - $58 Off',
      max_redemptions: 20,
      metadata: {
        purpose: 'real_purchase_testing',
        created_by: 'admin',
        description: 'Makes $59 course cost $1 for real purchase flow testing'
      }
    })
    
    console.log('✅ Coupon created successfully!')
    console.log('📋 Coupon Details:')
    console.log(`   - ID: ${coupon.id}`)
    console.log(`   - Discount: $${coupon.amount_off! / 100} off`)
    console.log(`   - Name: ${coupon.name}`)
    console.log(`   - Max uses: ${coupon.max_redemptions}`)
    console.log(`   - Valid: ${coupon.valid}`)
    
    console.log('\n🚀 Ready to test real purchase flow!')
    console.log('💰 $59 course will cost only $1 with this code')
    console.log('🎯 Use coupon code "REAL-TEST-58OFF" at checkout')
    console.log('\n💡 This will trigger the REAL paid purchase flow:')
    console.log('   ✅ Auto-create user account')
    console.log('   ✅ Send welcome email with credentials')
    console.log('   ✅ Auto-enroll in training')
    console.log('   ✅ Immediate training access')
    
  } catch (error: any) {
    if (error.code === 'resource_already_exists') {
      console.log('✅ Coupon already exists!')
      console.log('🎯 Use coupon code "REAL-TEST-58OFF" for $1 testing')
      
      // Get existing coupon details
      try {
        const existing = await stripe.coupons.retrieve('REAL-TEST-58OFF')
        console.log('\n📋 Existing Coupon Details:')
        console.log(`   - Discount: $${existing.amount_off! / 100} off`)
        console.log(`   - Times Used: ${existing.times_redeemed}/${existing.max_redemptions}`)
        console.log(`   - Valid: ${existing.valid}`)
      } catch (retrieveError) {
        console.log('Could not retrieve existing coupon details')
      }
    } else {
      console.error('❌ Error creating coupon:', error)
      process.exit(1)
    }
  }
}

createRealTestCoupon() 