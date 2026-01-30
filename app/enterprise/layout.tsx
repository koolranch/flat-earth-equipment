'use client';

import { RBACProvider } from '@/components/enterprise/auth/RoleGuard';

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RBACProvider>
      {children}
    </RBACProvider>
  );
}
