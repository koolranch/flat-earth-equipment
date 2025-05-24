import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function cleanupDuplicates() {
  const testEmail = 'flatearthequip@gmail.com'
  
  try {
    console.log('🧹 Starting cleanup...')
    
    // Get user
    const { data: authData } = await supabase.auth.admin.listUsers()
    const user = authData?.users.find(u => u.email === testEmail)
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    // 1. Clean up duplicate modules
    console.log('\n📚 Cleaning up duplicate modules...')
    
    // Get all modules
    const { data: modules } = await supabase
      .from('modules')
      .select('*')
      .order('order')
      .order('created_at')
    
    if (modules) {
      // Group by course_id and order
      const moduleGroups = modules.reduce((acc: any, module) => {
        const key = `${module.course_id}-${module.order}`
        if (!acc[key]) acc[key] = []
        acc[key].push(module)
        return acc
      }, {})
      
      // Keep only the first module in each group, delete the rest
      for (const [key, group] of Object.entries(moduleGroups)) {
        const moduleGroup = group as any[]
        if (moduleGroup.length > 1) {
          console.log(`Found ${moduleGroup.length} modules for order ${moduleGroup[0].order}`)
          
          // Keep the first one, delete the rest
          const toDelete = moduleGroup.slice(1).map((m: any) => m.id)
          
          const { error } = await supabase
            .from('modules')
            .delete()
            .in('id', toDelete)
            
          if (error) {
            console.error('Error deleting modules:', error)
          } else {
            console.log(`✅ Deleted ${toDelete.length} duplicate modules`)
          }
        }
      }
    }
    
    // 2. Clean up duplicate enrollments
    console.log('\n🎓 Cleaning up duplicate enrollments...')
    
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at')
    
    if (enrollments && enrollments.length > 1) {
      console.log(`Found ${enrollments.length} enrollments`)
      
      // Keep the first enrollment, delete the rest
      const toDelete = enrollments.slice(1).map(e => e.id)
      
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .in('id', toDelete)
        
      if (error) {
        console.error('Error deleting enrollments:', error)
      } else {
        console.log(`✅ Deleted ${toDelete.length} duplicate enrollments`)
      }
    }
    
    // 3. Verify final state
    console.log('\n📊 Verifying final state...')
    
    const { data: finalModules } = await supabase
      .from('modules')
      .select('*')
      .order('order')
    
    const { data: finalEnrollments } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
    
    console.log(`✅ Final state: ${finalModules?.length || 0} modules, ${finalEnrollments?.length || 0} enrollments`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

cleanupDuplicates() 