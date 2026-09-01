'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Sparkles,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Award,
  TrendingUp,
  AlertCircle,
  Mail,
  Phone,
  Store,
  DollarSign,
} from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Table } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CustomerClusteringModal } from '@/components/intelligence/CustomerClusteringModal';
import { CustomerDetailModal } from '@/components/intelligence/CustomerDetailModal';
import { initialCustomers, initialCustomerClusters } from '@/data/customers';
import { initialStores } from '@/data/stores';

export default function CustomersPage() {
  const { t } = useAppSettings();

  const [customerList, setCustomerList] = useState(initialCustomers);
  const [clusters, setClusters] = useState(initialCustomerClusters);
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [storeFilter, setStoreFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [isClusteringOpen, setIsClusteringOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [activeCustomer, setActiveCustomer] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    segment: 'New',
    preferredStore: 'Indiranagar Flagship (Store 01)',
  });

  const storeOptions = useMemo(() => {
    const list = Array.from(new Set(customerList.map((c) => c.preferredStore).filter(Boolean)));
    return ['All', ...list];
  }, [customerList]);

  const filteredCustomers = useMemo(() => {
    return customerList.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSegment = segmentFilter === 'All' || c.segment === segmentFilter;
      const matchesStore = storeFilter === 'All' || c.preferredStore === storeFilter;

      return matchesSearch && matchesSegment && matchesStore;
    });
  }, [customerList, searchTerm, segmentFilter, storeFilter]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      segment: 'New',
      preferredStore: 'Indiranagar Flagship (Store 01)',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setActiveCustomer(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      segment: c.segment,
      preferredStore: c.preferredStore || 'Indiranagar Flagship (Store 01)',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (c) => {
    setActiveCustomer(c);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDetail = (c) => {
    setActiveCustomer(c);
    setIsDetailModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const newCust = {
      id: `cust-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '+91 90000 00000',
      orders: 1,
      totalSpent: 1200,
      aov: 1200,
      segment: formData.segment,
      cluster: 'Cluster 3: New / Emerging',
      recencyDays: 1,
      frequency: 1,
      monetary: 1200,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      preferredStore: formData.preferredStore,
      aiInsight: 'Newly added customer record.',
      recommendedAction: 'Send automated welcome incentive.',
      recentPurchases: [
        { id: `ord-${Date.now().toString().slice(-4)}`, date: 'Today', items: 'Welcome Grocery Basket', total: 1200, payment: 'UPI' }
      ]
    };

    setCustomerList([newCust, ...customerList]);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeCustomer) return;

    setCustomerList(
      customerList.map((c) =>
        c.id === activeCustomer.id
          ? {
              ...c,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              segment: formData.segment,
              preferredStore: formData.preferredStore,
            }
          : c
      )
    );
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (activeCustomer) {
      setCustomerList(customerList.filter((c) => c.id !== activeCustomer.id));
      setIsDeleteDialogOpen(false);
      setActiveCustomer(null);
    }
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
      header: t('customer'),
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt={row.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-2xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {row.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{row.name}</div>
            <div className="text-[11px] text-slate-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: t('primaryStore'),
      accessor: 'preferredStore',
      render: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {row.preferredStore?.split('(')[0] || 'Indiranagar Flagship'}
        </span>
      ),
    },
    {
      header: t('orders'),
      accessor: 'orders',
      render: (row) => <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{row.orders} {t('orders').toLowerCase()}</span>,
    },
    {
      header: t('totalSpent'),
      accessor: 'totalSpent',
      render: (row) => (
        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">
          ₹{row.totalSpent.toLocaleString()}
        </span>
      ),
    },
    {
      header: t('avgOrderValue'),
      accessor: 'aov',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          ₹{row.aov?.toLocaleString() || Math.round(row.totalSpent / (row.orders || 1)).toLocaleString()}
        </span>
      ),
    },
    {
      header: t('rfmSegment'),
      accessor: 'segment',
      render: (row) => (
        <Badge variant={getSegmentBadgeVariant(row.segment)} size="sm">
          {row.segment}
        </Badge>
      ),
    },
    {
      header: t('status'),
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'warning'} size="sm" dot>
          {row.status}
        </Badge>
      ),
    },
    {
      header: t('actions'),
      accessor: 'actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenDetail(row)}
            title="Customer RFM Diagnostics"
            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Customer"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            title="Delete Record"
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Prominent Clustering Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('customerManagement')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            K-Means behavioral clustering, Recency-Frequency-Monetary (RFM) segmentation, and churn recovery across all retail stores.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            onClick={() => setIsClusteringOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            {t('runClustering')}
          </Button>
          <Button 
            variant="outline" 
            size="md" 
            icon={Plus} 
            onClick={handleOpenAdd}
            className="cursor-pointer"
          >
            {t('addCustomer')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Enterprise Profiles"
          value="790"
          change="+24 this month"
          isPositive={true}
          icon={Users}
        />
        <StatCard
          title="Cluster 1 Champions"
          value="142"
          change="₹1.45L Avg LTV"
          isPositive={true}
          icon={Award}
          onClick={() => setIsClusteringOpen(true)}
        />
        <StatCard
          title="Cluster 2 Loyal Regulars"
          value="380"
          change="48% Base"
          isPositive={null}
          icon={TrendingUp}
          onClick={() => setIsClusteringOpen(true)}
        />
        <StatCard
          title="Cluster 4 At-Risk Churn"
          value="103"
          change="High Priority"
          isPositive={false}
          subtitle="74% Churn Probability"
          icon={AlertCircle}
          onClick={() => setIsClusteringOpen(true)}
        />
      </div>

      {/* Filter and Search Bar with Store and Segment filters */}
      <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search customer name, email, phone..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <Select
            value={storeFilter}
            onChange={(e) => {
              setStoreFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={storeOptions.map((st) => ({ value: st, label: st === 'All' ? 'All Stores' : st.split('(')[0] }))}
            className="w-44"
          />

          <Select
            value={segmentFilter}
            onChange={(e) => {
              setSegmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: 'All RFM Segments' },
              { value: 'VIP', label: 'VIP Champions' },
              { value: 'Loyal', label: 'Loyal Regulars' },
              { value: 'Growing', label: 'Growing / Emerging' },
              { value: 'At Risk', label: 'At Risk / Churning' },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Customer Table */}
      <Table
        columns={columns}
        data={paginatedCustomers}
        emptyMessage="No customer records match the current filter selection."
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredCustomers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* K-Means Customer Clustering Modal */}
      <CustomerClusteringModal
        isOpen={isClusteringOpen}
        onClose={() => setIsClusteringOpen(false)}
        onClusteringComplete={(updated) => setClusters(updated)}
      />

      {/* Customer RFM Detail & Purchase History Modal */}
      <CustomerDetailModal
        customer={activeCustomer}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setActiveCustomer(null);
        }}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer Profile"
        subtitle="Create a new customer account record in the platform"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Save Customer
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            label="Primary Store"
            value={formData.preferredStore}
            onChange={(e) => setFormData({ ...formData, preferredStore: e.target.value })}
            options={initialStores.map((s) => `${s.name} (${s.code})`)}
          />
          <Select
            label="Initial RFM Cohort"
            value={formData.segment}
            onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
            options={['New', 'Loyal', 'VIP', 'At Risk']}
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Customer Profile"
        subtitle={`Updating profile: ${activeCustomer?.name}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            label="Primary Store"
            value={formData.preferredStore}
            onChange={(e) => setFormData({ ...formData, preferredStore: e.target.value })}
            options={initialStores.map((s) => `${s.name} (${s.code})`)}
          />
          <Select
            label="RFM Segment"
            value={formData.segment}
            onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
            options={['New', 'Loyal', 'VIP', 'At Risk']}
          />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer Profile"
        message={`Are you sure you want to remove ${activeCustomer?.name}? This will remove them from K-Means clustering.`}
      />
    </div>
  );
}
