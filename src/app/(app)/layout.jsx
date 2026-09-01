'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SellerLayout } from '@/components/layout/SellerLayout';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { LoadingState } from '@/components/common/LoadingState';
import { ROLES, isRouteAllowedForRole, getRoleHomeRoute } from '@/lib/auth';

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // Check if user role is allowed to access the current pathname
      const isAllowed = isRouteAllowedForRole(role, pathname);
      if (!isAllowed) {
        const fallbackRoute = getRoleHomeRoute(role);
        router.replace(fallbackRoute);
      }
    }
  }, [isAuthenticated, isLoading, role, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingState message="Verifying session and permissions..." />
      </div>
    );
  }

  // Prevent flash of unauthorized content while redirecting
  const isAllowed = isRouteAllowedForRole(role, pathname);
  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingState message="Redirecting to your authorized workspace..." />
      </div>
    );
  }

  // Render role-specific layout
  if (role === ROLES.CUSTOMER) {
    return <CustomerLayout>{children}</CustomerLayout>;
  }

  if (role === ROLES.SELLER) {
    return <SellerLayout>{children}</SellerLayout>;
  }

  // Default: Admin
  return <AdminLayout>{children}</AdminLayout>;
}
