import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

async function verifyCoupon() {
  try {
    console.log('🔍 Checking coupon: TEST-FORKLIFT-100')
    
    const coupon = await stripe.coupons.retrieve('TEST-FORKLIFT-100')
    
    console.log('✅ Coupon is LIVE and valid!')
    console.log('📋 Coupon Details:')
    console.log(`   - ID: ${coupon.id}`)
    console.log(`   - Discount: ${coupon.percent_off}% off`)
    console.log(`   - Valid: ${coupon.valid}`)
    console.log(`   - Times Used: ${coupon.times_redeemed}/${coupon.max_redemptions}`)
    console.log(`   - Created: ${new Date(coupon.created * 1000).toLocaleDateString()}`)
    
    console.log('\n✅ Ready to use on live site!')
    console.log('🎯 Go to: https://flatearthequipment.com/safety')
    console.log('💡 Click "Have a discount code?" and enter: TEST-FORKLIFT-100')
    
  } catch (error: any) {
    console.error('❌ Coupon not found:', error.message)
    console.log('🔧 Creating coupon now...')
    
    try {
      const newCoupon = await stripe.coupons.create({
        id: 'TEST-FORKLIFT-100',
        percent_off: 100,
        duration: 'forever',
        name: 'Test Forklift Training - 100% Off',
        max_redemptions: 50,
        metadata: {
          purpose: 'testing',
          created_by: 'admin'
        }
      })
      
      console.log('✅ Coupon created and ready!')
      console.log(`   - Code: ${newCoupon.id}`)
      console.log(`   - Discount: ${newCoupon.percent_off}% off`)
      
    } catch (createError: any) {
      console.error('❌ Failed to create coupon:', createError.message)
    }
  }
}

verifyCoupon() 