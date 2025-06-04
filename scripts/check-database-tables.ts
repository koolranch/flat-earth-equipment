import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkDatabaseTables() {
  try {
    console.log('🔍 Checking what tables exist in the database...')
    
    // Check specific tables that should exist
    const tablesToCheck = ['courses', 'modules', 'enrollments', 'orders', 'parts', 'rental_equipment', 'auth.users']
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (tableError) {
          console.log(`❌ ${tableName}: ${tableError.message}`)
        } else {
          console.log(`✅ ${tableName}: exists`)
          
          // Get count for important tables
          if (['courses', 'modules', 'parts', 'rental_equipment'].includes(tableName)) {
            const { count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true })
            console.log(`   └─ ${count} rows`)
          }
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err}`)
      }
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

checkDatabaseTables() 