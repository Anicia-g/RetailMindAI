'use client';

import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Star,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  MapPin
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
import { initialSuppliers } from '@/data/suppliers';

export default function SuppliersPage() {
  const { t } = useAppSettings();

  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: 'Electronics & Peripherals',
    leadTimeDays: '3',
    address: '',
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const match =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase());
      return match;
    });
  }, [suppliers, searchTerm]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSuppliers.slice(start, start + itemsPerPage);
  }, [filteredSuppliers, currentPage]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      category: 'Electronics & Peripherals',
      leadTimeDays: '3',
      address: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setActiveSupplier(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson,
      email: sup.email,
      phone: sup.phone,
      category: sup.category,
      leadTimeDays: String(sup.leadTimeDays),
      address: sup.address || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (sup) => {
    setActiveSupplier(sup);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDetail = (sup) => {
    setActiveSupplier(sup);
    setIsDetailModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newSup = {
      id: `sup-${Date.now()}`,
      name: formData.name,
      contactPerson: formData.contactPerson || 'Logistics Coordinator',
      email: formData.email,
      phone: formData.phone,
      category: formData.category,
      rating: 4.7,
      leadTimeDays: Number(formData.leadTimeDays) || 3,
      activeOrders: 0,
      totalOrdersCompleted: 1,
      reliabilityScore: '96%',
      address: formData.address || 'Industrial Hub',
      status: 'Active',
      suppliedProducts: ['General SKUs'],
    };

    setSuppliers([newSup, ...suppliers]);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeSupplier) return;

    setSuppliers(
      suppliers.map((s) =>
        s.id === activeSupplier.id
          ? {
              ...s,
              name: formData.name,
              contactPerson: formData.contactPerson,
              email: formData.email,
              phone: formData.phone,
              category: formData.category,
              leadTimeDays: Number(formData.leadTimeDays) || 3,
              address: formData.address,
            }
          : s
      )
    );
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (activeSupplier) {
      setSuppliers(suppliers.filter((s) => s.id !== activeSupplier.id));
      setIsDeleteDialogOpen(false);
      setActiveSupplier(null);
    }
  };

  const columns = [
    {
      header: 'Supplier Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
          <div className="text-xs text-slate-400">{row.category}</div>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      accessor: 'contactPerson',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{row.contactPerson}</div>
          <div className="text-[11px] text-slate-400">{row.phone}</div>
        </div>
      ),
    },
    {
      header: 'Lead Time',
      accessor: 'leadTimeDays',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {row.leadTimeDays} Days
        </span>
      ),
    },
    {
      header: 'Performance Rating',
      accessor: 'rating',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-xs">{row.rating}</span>
          <span className="text-[10px] text-emerald-600 font-semibold ml-1">({row.reliabilityScore} on-time)</span>
        </div>
      ),
    },
    {
      header: t('status'),
      accessor: 'status',
      render: (row) => (
        <Badge variant="success" size="sm" dot>
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
            title="View Details"
            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Supplier"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            title="Delete Supplier"
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
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('supplierManagement')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vendor relationship management, lead-time tracking, and fulfillment SLAs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            {t('addSupplier')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Suppliers"
          value="4 Vendors"
          change="97.2% SLA"
          isPositive={true}
          icon={Truck}
        />
        <StatCard
          title="Avg Lead Time"
          value="3.2 Days"
          change="-0.5 Days"
          isPositive={true}
          icon={Clock}
        />
        <StatCard
          title="Active Reorder POs"
          value="4 Open POs"
          change="₹1.85L Total"
          isPositive={null}
          icon={CheckCircle2}
        />
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
        <div className="w-full max-w-md">
          <Input
            placeholder="Search vendor name, category, representative..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <Table
        columns={columns}
        data={paginatedSuppliers}
        emptyMessage={t('noDataMatchingFilter')}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredSuppliers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Supplier Profile: ${activeSupplier?.name}`}
        subtitle={`Category: ${activeSupplier?.category}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="primary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {activeSupplier && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Representative</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeSupplier.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Contact Email</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeSupplier.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeSupplier.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Facility Location</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeSupplier.address}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Supplied Catalog SKUs
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeSupplier.suppliedProducts?.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('addSupplier')}
        subtitle="Register new vendor contact and logistics parameters"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Save Vendor
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <Input
            label="Supplier Company Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Lead Time (Days)"
              type="number"
              value={formData.leadTimeDays}
              onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
            />
          </div>
          <Input
            label="Warehouse / Factory Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Supplier"
        subtitle={`Updating: ${activeSupplier?.name}`}
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
            label="Supplier Company Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <Input
            label="Lead Time (Days)"
            type="number"
            value={formData.leadTimeDays}
            onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
          />
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier Record"
        message={`Are you sure you want to delete ${activeSupplier?.name}? This will remove linked fulfillment lead time tracking.`}
      />
    </div>
  );
}
