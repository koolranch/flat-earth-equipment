import React from 'react';
import Link from 'next/link';
import { requireAdminServer } from '@/lib/admin/guard';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protect the entire admin section
  const adminCheck = await requireAdminServer();
  
  if (!adminCheck.ok) {
    if (adminCheck.reason === 'unauthorized') {
      redirect('/login?redirect=/admin');
    } else {
      redirect('/dashboard?error=admin-required');
    }
  }

  return (
    <section className="container mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Admin</h1>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            {adminCheck.role || 'admin'}
          </span>
        </div>
        
        <nav className="flex gap-3 text-sm">
          <Link 
            className="underline text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition" 
            href="/admin/roster"
          >
            Roster
          </Link>
          <Link 
            className="underline text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition" 
            href="/admin/audit"
          >
            Audit
          </Link>
          <Link 
            className="underline text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition" 
            href="/admin/service"
          >
            Service
          </Link>
          <Link 
            className="text-sm border border-slate-300 dark:border-slate-600 px-3 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition" 
            href="/dashboard"
          >
            ← Dashboard
          </Link>
        </nav>
      </header>
      
      <div className="space-y-1">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Welcome, {adminCheck.user.email}
        </p>
        <p className="text-xs text-slate-500">
          Admin access verified • All actions are logged for security
        </p>
      </div>
      
      {children}
    </section>
  );
}
