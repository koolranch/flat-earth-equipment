'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function cn(...c: (string | undefined | null | boolean)[]): string {
  return c.filter(Boolean).join(" ");
}

const items = [
  { href: "/training", label: "Certification" },
  { href: "/trainer", label: "Trainer" },
  { href: "/records", label: "Records" }
];

export default function SafetySubnav() {
  const pathname = usePathname() || "/";
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [enterpriseRole, setEnterpriseRole] = useState<string | null>(null);

  // Check if user is an enterprise member
  useEffect(() => {
    const checkEnterpriseStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: membership } = await supabase
            .from('org_members')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (membership) {
            setIsEnterprise(true);
            setEnterpriseRole(membership.role);
          }
        }
      } catch (error) {
        // Silently fail - user just won't see enterprise link
      }
    };
    
    checkEnterpriseStatus();
  }, []);

  // Determine dashboard label based on role
  const getDashboardLabel = () => {
    if (enterpriseRole === 'owner') return 'Owner Dashboard';
    if (enterpriseRole === 'admin') return 'Admin Dashboard';
    if (enterpriseRole === 'trainer' || enterpriseRole === 'manager') return 'Manager Dashboard';
    return 'Enterprise Dashboard';
  };
  
  return (
    <nav
      className="safety-subnav sticky top-16 z-30 w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200"
      role="navigation"
      aria-label="Safety & Training sub navigation"
      data-testid="safety-subnav"
      style={{
        // expose height for layouts that offset content
        // tailwind h-14 ~= 56px
        ['--subnav-h' as any]: '56px'
      }}
    >
      {/* Decorative line/gradient must not trap clicks */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-7xl h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {items.map(it => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "text-sm font-medium hover:text-blue-700 transition-colors",
                  active ? "text-blue-700 font-semibold" : "text-gray-700"
                )}
                aria-current={active ? "page" : undefined}
              >
                {it.label}
              </Link>
            );
          })}
        </div>
        
        {/* Enterprise Dashboard Link */}
        {isEnterprise && (
          <Link
            href="/enterprise/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#F76511] hover:bg-[#E55A0C] rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {getDashboardLabel()}
          </Link>
        )}
      </div>
    </nav>
  );
}
