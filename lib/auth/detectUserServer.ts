import { supabaseServer } from '@/lib/supabase/server';

export async function detectUserServer() {
  try {
    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    return { isAuthed: !!user, userId: user?.id ?? null };
  } catch (error) {
    // Fallback to unauthenticated if there's any error
    console.warn('Auth detection failed:', error);
    return { isAuthed: false, userId: null };
  }
}
