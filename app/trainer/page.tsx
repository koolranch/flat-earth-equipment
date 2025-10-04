import { unstable_noStore as noStore } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Facility Training Management | Bulk Forklift Certification | Flat Earth Equipment',
  description: 'Manage forklift certification for your entire team. Bulk training discounts, seat management, and progress tracking for facility trainers and safety managers.',
  keywords: [
    'facility training',
    'bulk forklift certification',
    'team training management',
    'safety manager tools',
    'group training discounts'
  ],
};

// Component for the public landing page
function PublicTrainerLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Facility Training Management
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Are you a facility trainer or safety manager responsible for certifying multiple staff members? 
              Our trainer platform makes it easy to manage forklift certification for your entire team.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-canyon-rust">Bulk Pricing</div>
                <div className="text-sm text-slate-300">Volume Discounts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-canyon-rust">Seat Management</div>
                <div className="text-sm text-slate-300">Easy Administration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-canyon-rust">Progress Tracking</div>
                <div className="text-sm text-slate-300">Real-time Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-canyon-rust">OSHA Compliant</div>
                <div className="text-sm text-slate-300">29 CFR 1910.178</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
              >
                Contact for Bulk Pricing
              </Link>
              <Link
                href="/safety"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-slate-900 transition-colors"
              >
                View Training Program
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Streamlined Training Management
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3">Team Management</h3>
              <p className="text-slate-600">
                Add team members, assign training seats, and track progress across your entire organization from one dashboard.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-3">Volume Discounts</h3>
              <p className="text-slate-600">
                Save significantly with bulk training packages. The more seats you need, the more you save on per-employee certification costs.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
              <p className="text-slate-600">
                Monitor completion rates, track certification expiration dates, and generate compliance reports for your facility.
              </p>
            </div>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Perfect for Facility Trainers & Safety Managers
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">You might be a good fit if you:</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Manage forklift training for 5+ employees
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Need to track certification compliance
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Want to reduce per-employee training costs
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Require OSHA 29 CFR 1910.178 compliance
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Need centralized training administration
                </li>
              </ul>
            </div>
            
            <div className="bg-canyon-rust/5 rounded-xl p-8 border border-canyon-rust/20">
              <h3 className="text-xl font-semibold mb-4">Common roles we serve:</h3>
              <ul className="space-y-2 text-slate-700">
                <li>• Safety Managers</li>
                <li>• Facility Trainers</li>
                <li>• Operations Managers</li>
                <li>• HR Directors</li>
                <li>• Warehouse Supervisors</li>
                <li>• Plant Managers</li>
                <li>• Training Coordinators</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Volume Pricing Tiers
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-2">Small Team</h3>
              <div className="text-3xl font-bold text-canyon-rust mb-4">5-15 seats</div>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li>• Basic seat management</li>
                <li>• Progress tracking</li>
                <li>• Email support</li>
                <li>• Standard reporting</li>
              </ul>
              <p className="text-sm text-slate-500">Contact for pricing</p>
            </div>
            
            <div className="bg-canyon-rust text-white rounded-xl p-6 shadow-lg border-2 border-canyon-rust relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white text-canyon-rust px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold mb-2">Medium Facility</h3>
              <div className="text-3xl font-bold mb-4">16-50 seats</div>
              <ul className="space-y-2 text-sm text-canyon-rust-100 mb-6">
                <li>• Advanced seat management</li>
                <li>• Detailed analytics</li>
                <li>• Priority support</li>
                <li>• Custom reporting</li>
                <li>• Bulk discounts</li>
              </ul>
              <p className="text-sm text-canyon-rust-200">Best value per seat</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <h3 className="text-lg font-semibold mb-2">Large Enterprise</h3>
              <div className="text-3xl font-bold text-canyon-rust mb-4">51+ seats</div>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li>• Enterprise features</li>
                <li>• Dedicated support</li>
                <li>• Custom integrations</li>
                <li>• Advanced reporting</li>
                <li>• Maximum discounts</li>
              </ul>
              <p className="text-sm text-slate-500">Custom pricing</p>
            </div>
          </div>
        </section>

        {/* Coming Soon Features */}
        <section className="mb-16">
          <div className="bg-slate-100 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">🚀 Enhanced Features Coming Soon</h2>
            <p className="text-slate-600 mb-6">
              Our trainer platform is continuously evolving. Here's what's coming next:
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="font-semibold">Advanced Analytics</div>
                <div className="text-slate-500">Detailed completion metrics</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-semibold">API Integration</div>
                <div className="text-slate-500">Connect with your HRIS</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-semibold">Custom Branding</div>
                <div className="text-slate-500">White-label options</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-semibold">Mobile App</div>
                <div className="text-slate-500">On-the-go management</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-canyon-rust to-canyon-rust/90 text-white rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Contact our team to discuss your facility's training needs and get a custom quote 
              with volume pricing for your team size.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                href="/contact"
                className="bg-white text-canyon-rust px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Request Bulk Pricing Quote
              </Link>
              
              <a
                href="tel:+1-307-555-0123"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-canyon-rust transition-colors"
              >
                Call (307) 555-0123
              </a>
            </div>
            
            <p className="text-sm text-canyon-rust-200">
              Already have a trainer account? <Link href="/login" className="underline hover:no-underline">Sign in here</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

// Component for the authenticated trainer dashboard
async function AuthenticatedTrainerDashboard(orgId: string, role: string) {
  const supabase = supabaseServer();

  // Try to load org (may or may not have a name column — handle gracefully)
  const { data: org } = await supabase
    .from('orgs')
    .select('id, name')
    .eq('id', orgId)
    .maybeSingle();

  // Members in this org (email comes from profiles; fall back if not joinable)
  const { data: members } = await supabase
    .from('org_members')
    .select('user_id, role')
    .eq('org_id', orgId);

  let emails: Record<string, string> = {};
  if (members && members.length) {
    const ids = members.map(m => m.user_id);
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', ids);
    for (const p of profs || []) emails[p.id] = p.email || '';
  }

  // Counts for invites and seats (RLS will enforce visibility)
  const [{ count: inviteCount }, { count: orgSeatCount }, { count: companySeatCount }] = await Promise.all([
    supabase.from('invitations').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('org_seats').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('company_seats').select('id', { count: 'exact', head: true })
  ]);

  return (
    <div className="mx-auto max-w-3xl py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Trainer Dashboard</h1>
        <p className="text-sm text-muted-foreground">Role: {role}</p>
      </div>

      <section className="rounded-2xl p-4 border">
        <h2 className="text-lg font-medium">Organization</h2>
        <div className="mt-2 text-sm">ID: <code>{org?.id || orgId}</code></div>
        {org?.name && <div className="text-sm">Name: {org.name}</div>}
      </section>

      <section className="rounded-2xl p-4 border">
        <h2 className="text-lg font-medium">Members</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {(members || []).map(m => (
            <li key={m.user_id} className="flex items-center justify-between">
              <span>{emails[m.user_id] || m.user_id}</span>
              <span className="text-muted-foreground">{m.role}</span>
            </li>
          ))}
          {(!members || members.length === 0) && <li className="text-muted-foreground">No members yet.</li>}
        </ul>
      </section>

      <section className="rounded-2xl p-4 border grid grid-cols-3 gap-4">
        <div>
          <div className="text-2xl font-semibold">{inviteCount ?? 0}</div>
          <div className="text-sm text-muted-foreground">Pending Invites</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{orgSeatCount ?? 0}</div>
          <div className="text-sm text-muted-foreground">Org Seats</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{companySeatCount ?? 0}</div>
          <div className="text-sm text-muted-foreground">Company Seats</div>
        </div>
      </section>

      <section className="rounded-2xl p-4 border">
        <h2 className="text-lg font-medium">Actions</h2>
        <div className="mt-3 flex gap-3">
          <a href="/trainer/invites" className="btn-primary">Manage Invites</a>
          <span className="text-sm text-muted-foreground">More tools coming soon</span>
        </div>
      </section>
    </div>
  );
}

export default async function TrainerHome() {
  noStore();
  
  // Check if user is authenticated and has trainer role
  try {
    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // User is not authenticated, show public landing page
      return <PublicTrainerLanding />;
    }

    // Check if user has trainer/owner role in any organization
    const { data: orgMemberships } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'trainer']);

    if (!orgMemberships || orgMemberships.length === 0) {
      // User is authenticated but not a trainer, show public landing page
      return <PublicTrainerLanding />;
    }

    // User is authenticated and has trainer role, show dashboard
    const { org_id: orgId, role } = orgMemberships[0];
    return await AuthenticatedTrainerDashboard(orgId, role);
    
  } catch (error) {
    // If there's any error with authentication check, show public landing page
    console.error('Error checking trainer authentication:', error);
    return <PublicTrainerLanding />;
  }
}