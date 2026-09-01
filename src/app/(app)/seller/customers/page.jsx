'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  Award,
  ShoppingBag,
  Star,
  Plus,
  CheckCircle2,
  Eye,
  Store,
  DollarSign,
  Repeat,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { initialCustomers } from '@/data/customers';
import { customerService } from '@/services/customerService';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Table } from '@/components/common/Table';
import { BestCustomerCard } from '@/components/intelligence/BestCustomerCard';
import { CustomerDetailModal } from '@/components/intelligence/CustomerDetailModal';

export default function SellerCustomersPage() {
  const { user } = useAuth();
  const currentStore = user?.store || 'Indiranagar Flagship (Store 01)';

  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      const storeCusts = await customerService.getStoreCustomers(currentStore);
      const bestAnalytics = await customerService.getBestCustomerAnalytics(currentStore);
      setCustomers(storeCusts);
      setAnalytics(bestAnalytics);
    };
    fetchStoreData();
  }, [currentStore]);

  // Seller only sees customers for their assigned store (isolated data boundary)
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const handleOpenDetail = (cust) => {
    setSelectedCustomerDetail(cust);
    setIsDetailModalOpen(true);
  };

  const getSegmentBadgeVariant = (segment) => {
    switch (segment) {
      case 'VIP':
      case 'High Value':
        return 'purple';
      case 'Loyal':
      case 'Regular':
        return 'success';
      case 'Growing':
      case 'New':
        return 'info';
      case 'At Risk':
        return 'danger';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
          />
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{row.name}</div>
            <div className="text-[11px] text-slate-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Orders',
      accessor: 'orders',
      render: (row) => <span className="font-bold text-xs">{row.orders} orders</span>,
    },
    {
      header: 'Total Spent',
      accessor: 'totalSpent',
      render: (row) => (
        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">
          ₹{row.totalSpent.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Average Order Value (AOV)',
      accessor: 'aov',
      render: (row) => (
        <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
          ₹{row.aov?.toLocaleString() || Math.round(row.totalSpent / (row.orders || 1)).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Last Purchase',
      accessor: 'lastPurchase',
      render: (row) => <span className="text-xs text-slate-500">{row.lastPurchase}</span>,
    },
    {
      header: 'Segment',
      accessor: 'segment',
      render: (row) => (
        <Badge variant={getSegmentBadgeVariant(row.segment)} size="sm">
          {row.segment}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'warning'} size="sm" dot>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Eye}
          onClick={() => handleOpenDetail(row)}
          className="text-xs font-bold"
        >
          View Customer
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-7 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              STORE CUSTOMERS ONLY
            </span>
            <span className="text-xs text-slate-400">
              {currentStore.split('(')[0]}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            MY STORE CUSTOMERS
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active shoppers, loyalty tiers, repeat purchase history, and RFM intelligence for your assigned store.
          </p>
        </div>

        <Badge variant="purple" size="md">
          {customers.length} Store Shopper Accounts
        </Badge>
      </div>

      {/* 🏆 BEST CUSTOMERS FEATURE SPOTLIGHT */}
      {analytics && (
        <BestCustomerCard
          analytics={analytics}
          onViewCustomer={handleOpenDetail}
        />
      )}

      {/* Search Bar */}
      <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <Input
          placeholder="Lookup customer by name, phone (+91), or email..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Store Customer Table */}
      <Table
        columns={columns}
        data={filteredCustomers}
        emptyMessage="No store customers found matching your search."
      />

      {/* Customer Detail & Purchase History Modal */}
      <CustomerDetailModal
        customer={selectedCustomerDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCustomerDetail(null);
        }}
      />
    </div>
  );
}
