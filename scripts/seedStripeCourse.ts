import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedStripeCourse() {
  try {
    console.log('Creating Stripe product and price for test course...');
    
    // Create Stripe product
    const product = await stripe.products.create({
      name: 'Forklift Operator Certification (BETA)',
      description: 'Placeholder course used for UX, QA, and SEO prototyping.',
      metadata: {
        course_slug: 'forklift',
        type: 'course'
      }
    });
    
    console.log('✅ Created Stripe product:', product.id);
    
    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 5900, // $59.00
      currency: 'usd',
      metadata: {
        course_slug: 'forklift'
      }
    });
    
    console.log('✅ Created Stripe price:', price.id);
    
    // Update course in Supabase with real Stripe price ID
    const { error } = await supabase
      .from('courses')
      .update({
        stripe_price: price.id
      })
      .eq('slug', 'forklift');
      
    if (error) {
      console.error('❌ Error updating course:', error);
      return;
    }
    
    console.log('✅ Updated course with Stripe IDs');
    console.log('\nTest course is ready!');
    console.log('Product ID:', product.id);
    console.log('Price ID:', price.id);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedStripeCourse(); 