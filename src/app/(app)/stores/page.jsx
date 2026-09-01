'use client';

import React, { useState, useMemo } from 'react';
import {
  Store,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  IndianRupee,
  Users,
  AlertTriangle,
  MapPin,
  Phone,
  Sparkles
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
import { initialStores } from '@/data/stores';

export default function StoresPage() {
  const { t } = useAppSettings();

  const [stores, setStores] = useState(initialStores);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeStore, setActiveStore] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    manager: '',
    phone: '',
    address: '',
  });

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const match =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.manager.toLowerCase().includes(searchTerm.toLowerCase());
      return match;
    });
  }, [stores, searchTerm]);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage) || 1;
  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStores.slice(start, start + itemsPerPage);
  }, [filteredStores, currentPage]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: `Store ${stores.length + 1}`,
      city: '',
      manager: '',
      phone: '',
      address: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (st) => {
    setActiveStore(st);
    setFormData({
      name: st.name,
      code: st.code,
      city: st.city,
      manager: st.manager,
      phone: st.phone,
      address: st.address || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (st) => {
    setActiveStore(st);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDetail = (st) => {
    setActiveStore(st);
    setIsDetailModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newStore = {
      id: `store-${Date.now()}`,
      name: formData.name,
      code: formData.code,
      city: formData.city || 'Regional Hub',
      state: 'India',
      manager: formData.manager || 'Assigned Manager',
      phone: formData.phone || '+91 80 0000 0000',
      employeesCount: 12,
      monthlySales: 2800000,
      inventoryHealth: 'Healthy',
      stockoutItemsCount: 0,
      status: 'Active',
      address: formData.address || 'Commercial Center',
    };

    setStores([newStore, ...stores]);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeStore) return;

    setStores(
      stores.map((s) =>
        s.id === activeStore.id
          ? {
              ...s,
              name: formData.name,
              code: formData.code,
              city: formData.city,
              manager: formData.manager,
              phone: formData.phone,
              address: formData.address,
            }
          : s
      )
    );
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (activeStore) {
      setStores(stores.filter((s) => s.id !== activeStore.id));
      setIsDeleteDialogOpen(false);
      setActiveStore(null);
    }
  };

  const columns = [
    {
      header: 'Store Outlet',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>{row.name}</span>
            {row.code === 'Store 12' && (
              <Badge variant="danger" size="sm">
                STOCKOUT ALERT
              </Badge>
            )}
          </div>
          <div className="text-xs text-slate-400">
            {row.code} • {row.city}
          </div>
        </div>
      ),
    },
    {
      header: 'Store Manager',
      accessor: 'manager',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{row.manager}</div>
          <div className="text-[11px] text-slate-400">{row.phone}</div>
        </div>
      ),
    },
    {
      header: 'Monthly Revenue',
      accessor: 'monthlySales',
      render: (row) => (
        <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
          ₹{(row.monthlySales / 100000).toFixed(1)} Lakhs
        </div>
      ),
    },
    {
      header: 'Stockouts',
      accessor: 'stockoutItemsCount',
      render: (row) => (
        <span
          className={`font-bold text-xs ${
            row.stockoutItemsCount > 3 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {row.stockoutItemsCount} SKUs
        </span>
      ),
    },
    {
      header: 'Inventory Health',
      accessor: 'inventoryHealth',
      render: (row) => (
        <Badge
          variant={row.inventoryHealth.includes('Critical') ? 'danger' : row.inventoryHealth.includes('Low') ? 'warning' : 'success'}
          size="sm"
          dot
        >
          {row.inventoryHealth}
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
            title="View Store Diagnostics"
            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Store"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            title="Delete Store"
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('storeManagement')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-store inventory allocation, local demand velocity, and retail location diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            {t('addStore')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Outlets"
          value="4 Stores"
          change="Metros & Hubs"
          isPositive={true}
          icon={Store}
        />
        <StatCard
          title="Top Performing Store"
          value="Connaught Place (Store 04)"
          change="₹51.2L Monthly"
          isPositive={true}
          icon={IndianRupee}
        />
        <StatCard
          title="Store 12 Stockout Alert"
          value="6 SKUs Depleted"
          change="-8% Deficit"
          isPositive={false}
          subtitle="Bandra West outlet"
          icon={AlertTriangle}
          onClick={() => handleOpenDetail(stores.find((s) => s.code === 'Store 12'))}
        />
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
        <div className="w-full max-w-md">
          <Input
            placeholder="Search store name, city, code, manager..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Store Table */}
      <Table
        columns={columns}
        data={paginatedStores}
        emptyMessage={t('noDataMatchingFilter')}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredStores.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Store Detail Diagnostics Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`${activeStore?.name} (${activeStore?.code}) — Intelligence`}
        subtitle={`Location: ${activeStore?.city}, ${activeStore?.state}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="primary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {activeStore && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Manager</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeStore.manager}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeStore.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Monthly Sales</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹{(activeStore.monthlySales / 100000).toFixed(1)}L</span>
              </div>
              <div>
                <span className="text-slate-400 block">Staff Count</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeStore.employeesCount} Employees</span>
              </div>
            </div>

            {activeStore.aiAlert && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <span>AI Root Cause Diagnostic</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeStore.aiAlert}
                </p>
              </div>
            )}

            <div className="text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-300">Address:</strong> {activeStore.address}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Store Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('addStore')}
        subtitle="Register new retail location or fulfillment node"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Save Outlet
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Store Outlet Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Store Code / ID"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Store Manager Name"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            />
          </div>
          <Input
            label="Contact Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Street Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </form>
      </Modal>

      {/* Edit Store Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Store Outlet"
        subtitle={`Updating: ${activeStore?.name}`}
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
            label="Store Outlet Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Store Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <Input
            label="Store Manager"
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
          />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Store Location"
        message={`Are you sure you want to remove ${activeStore?.name}? This will affect regional inventory tracking.`}
      />
    </div>
  );
}
