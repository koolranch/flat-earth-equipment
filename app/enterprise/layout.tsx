'use client';

import { RBACProvider, useRBAC } from '@/components/enterprise/auth/RoleGuard';
import { ROLE_DEFINITIONS } from '@/lib/enterprise/rbac';

function EnterpriseNav() {
  const { role, isLoading } = useRBAC();
  
  if (isLoading) return null;

  const roleInfo = ROLE_DEFINITIONS[role];
  
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/enterprise/dashboard" className="text-white hover:text-orange-400 font-semibold transition-colors">
              🏢 Enterprise Hub
            </a>
            <nav className="hidden md:flex gap-4 text-sm">
              {(role === 'owner' || role === 'admin') && (
                <a href="/enterprise/dashboard" className="text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </a>
              )}
              {role === 'owner' && (
                <a href="/enterprise/analytics" className="text-slate-300 hover:text-white transition-colors">
                  Analytics
                </a>
              )}
              {(role === 'owner' || role === 'admin') && (
                <a href="/enterprise/team" className="text-slate-300 hover:text-white transition-colors">
                  Team
                </a>
              )}
              {(role === 'owner' || role === 'admin') && (
                <a href="/enterprise/bulk" className="text-slate-300 hover:text-white transition-colors">
                  Bulk Ops
                </a>
              )}
              {(role === 'owner' || role === 'admin') && (
                <a href="/trainer/dashboard" className="text-slate-300 hover:text-white transition-colors">
                  Trainer View
                </a>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${
                role === 'owner' ? 'bg-purple-400' :
                role === 'admin' ? 'bg-blue-400' :
                role === 'manager' ? 'bg-green-400' :
                role === 'member' ? 'bg-yellow-400' :
                'bg-slate-400'
              }`}></div>
              <span className="text-xs font-semibold text-white">
                {roleInfo?.displayName || 'Member'}
              </span>
            </div>
            <a 
              href="/training" 
              className="bg-[#F76511] hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              My Training
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RBACProvider>
      <EnterpriseNav />
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    </RBACProvider>
  );
}
