import { createClient } from '@/utils/supabase/server'

export async function getRentalModel(category: string, model: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .eq('category', category)
    .eq('slug', model)
    .single()

  if (error || !data) return null
  return data
} 