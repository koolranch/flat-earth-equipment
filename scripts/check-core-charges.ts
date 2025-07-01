import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkCoreCharges() {
  try {
    console.log('🔍 Checking all parts with core charges...\n')
    
    // Get all parts with core charges
    const { data: partsWithCores, error } = await supabase
      .from('parts')
      .select('sku, name, has_core_charge, core_charge, price, category, brand')
      .eq('has_core_charge', true)
      .order('category', { ascending: true })

    if (error) {
      console.error('❌ Error fetching parts:', error)
      return
    }

    if (!partsWithCores || partsWithCores.length === 0) {
      console.log('⚠️  No parts found with core charges!')
      
      // Check if any parts exist at all
      const { count } = await supabase
        .from('parts')
        .select('*', { count: 'exact', head: true })
      
      console.log(`📊 Total parts in database: ${count}`)
      return
    }

    console.log(`✅ Found ${partsWithCores.length} parts with core charges:\n`)
    
    // Group by category for better display
    const groupedParts = partsWithCores.reduce((acc, part) => {
      if (!acc[part.category]) acc[part.category] = []
      acc[part.category].push(part)
      return acc
    }, {} as Record<string, typeof partsWithCores>)

    for (const [category, parts] of Object.entries(groupedParts)) {
      console.log(`📦 ${category} (${parts.length} items):`)
      
      for (const part of parts) {
        console.log(`  • ${part.sku} - ${part.name}`)
        console.log(`    Brand: ${part.brand} | Price: $${part.price} | Core: $${part.core_charge}`)
      }
      console.log()
    }

    // Summary
    const totalCoreValue = partsWithCores.reduce((sum, part) => sum + (part.core_charge || 0), 0)
    console.log(`💰 Total core charge value across all parts: $${totalCoreValue.toFixed(2)}`)
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

checkCoreCharges() 