import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { EnterpriseDashboardClient } from './dashboard-client';

async function checkAuthentication() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login?next=/enterprise/dashboard');
  }

  return user;
}

export default async function EnterpriseDashboard() {
  const user = await checkAuthentication();
  
  return <EnterpriseDashboardClient user={user} />;
}