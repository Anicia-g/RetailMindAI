'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { SellerLayout } from './SellerLayout';
import { CustomerLayout } from './CustomerLayout';
import { ROLES } from '@/lib/auth';

export function MainLayout({ children }) {
  const { role } = useAuth();

  if (role === ROLES.CUSTOMER) {
    return <CustomerLayout>{children}</CustomerLayout>;
  }

  if (role === ROLES.SELLER) {
    return <SellerLayout>{children}</SellerLayout>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
