import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function createTestCoupon() {
  try {
    console.log('🎟️ Creating test coupon for forklift training...')
    
    const coupon = await stripe.coupons.create({
      id: 'TEST-FORKLIFT-100',
      percent_off: 100,
      duration: 'forever',
      name: 'Test Forklift Training - 100% Off',
      max_redemptions: 10,
      metadata: {
        purpose: 'testing',
        created_by: 'admin',
        description: 'Full discount for testing forklift training flow'
      }
    })
    
    console.log('✅ Test coupon created successfully!')
    console.log('📋 Coupon Details:')
    console.log(`   - ID: ${coupon.id}`)
    console.log(`   - Discount: ${coupon.percent_off}% off`)
    console.log(`   - Name: ${coupon.name}`)
    console.log(`   - Max uses: ${coupon.max_redemptions}`)
    console.log(`   - Valid: ${coupon.valid}`)
    
    console.log('\n🚀 Ready to test!')
    console.log('Use coupon code "TEST-FORKLIFT-100" at checkout for 100% discount')
    
  } catch (error: any) {
    if (error.code === 'resource_already_exists') {
      console.log('✅ Test coupon already exists!')
      console.log('Use coupon code "TEST-FORKLIFT-100" for testing')
    } else {
      console.error('❌ Error creating coupon:', error)
      process.exit(1)
    }
  }
}

createTestCoupon() 