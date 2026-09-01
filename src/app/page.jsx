'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleHomeRoute } from '@/lib/auth';
import { LoadingState } from '@/components/common/LoadingState';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const target = isAuthenticated ? getRoleHomeRoute(role) : '/login';
      router.replace(target);
      const fallbackTimer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
          window.location.replace(target);
        }
      }, 300);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isAuthenticated, isLoading, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <LoadingState message="Redirecting to RetailMind AI..." />
    </div>
  );
}
