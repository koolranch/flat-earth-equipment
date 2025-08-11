import Stripe from 'stripe'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Known training course price IDs from the codebase
const trainingPriceIds = [
  'price_1RSHWVHJI548rO8Jf9CJer6y', // Old BETA price ID
  'price_1RS834HJI548rO8JpJMyGhL3', // Single operator
  'price_1RS835HJI548rO8JkMXj7FMQ', // 5-pack
  'price_1RS835HJI548rO8JbvRrMwUv', // 25-pack
  'price_1RS836HJI548rO8JwlCAzg7m'  // Unlimited
]

async function fixTrainingProducts() {
  try {
    console.log('🎯 Finding and fixing training course products...')
    
    // Get all products
    const products = await stripe.products.list({ active: true, limit: 100 })
    
    console.log('📋 All Stripe products:')
    products.data.forEach(p => {
      console.log(`   - ${p.id}: ${p.name}`)
      if (p.description) console.log(`     Description: ${p.description}`)
    })
    console.log()
    
    // Find products by getting prices and their associated products
    const trainingProducts = new Set<string>()
    
    for (const priceId of trainingPriceIds) {
      try {
        const price = await stripe.prices.retrieve(priceId)
        if (typeof price.product === 'string') {
          trainingProducts.add(price.product)
          console.log(`✅ Found product ${price.product} for price ${priceId}`)
        }
      } catch (error) {
        console.log(`⚠️ Price ${priceId} not found or inactive`)
      }
    }
    
    // Update each training product
    for (const productId of Array.from(trainingProducts)) {
      try {
        const product = await stripe.products.retrieve(productId as string)
        
        console.log(`📋 Current product: ${product.name}`)
        console.log(`📋 Current description: ${product.description}`)
        
        // Update product to production-ready
        const updatedProduct = await stripe.products.update(product.id, {
          name: 'Online Forklift Operator Certification',
          description: 'Complete OSHA-compliant forklift safety training with interactive demos and assessment. Earn your certification in under 90 minutes.',
          metadata: {
            course_slug: 'forklift',
            updated: new Date().toISOString(),
            status: 'production'
          }
        })
        
        console.log(`✅ Updated product ${product.id}`)
        console.log(`📋 New name: ${updatedProduct.name}`)
        console.log(`📋 New description: ${updatedProduct.description}`)
        console.log()
        
      } catch (error) {
        console.error(`❌ Error updating product ${productId}:`, error)
      }
    }
    
    console.log('🎉 All training products updated!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixTrainingProducts() 