'use client';

import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  Store,
  Mail,
  Phone,
  CheckCircle2,
  Ban,
  Star,
  Award,
  TrendingUp,
  RotateCcw,
  Target,
  Trophy,
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
import { initialEmployees, employeeRoles } from '@/data/employees';
import { initialStores } from '@/data/stores';

export default function EmployeesPage() {
  const { t } = useAppSettings();

  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [storeFilter, setStoreFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'Sales Executive',
    email: '',
    phone: '',
    store: 'Indiranagar Flagship (Store 01)',
  });

  const starSellers = useMemo(() => {
    return [...employees]
      .filter((e) => e.salesAmount)
      .sort((a, b) => (b.salesAmount || 0) - (a.salesAmount || 0))
      .slice(0, 3);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.store.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = roleFilter === 'All' || emp.role === roleFilter;
      const matchStore = storeFilter === 'All' || emp.store.includes(storeFilter);

      return matchSearch && matchRole && matchStore;
    });
  }, [employees, searchTerm, roleFilter, storeFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      role: 'Sales Executive',
      email: '',
      phone: '',
      store: initialStores[0]?.name || 'Indiranagar Flagship (Store 01)',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setActiveEmployee(emp);
    setFormData({
      name: emp.name,
      role: emp.role,
      email: emp.email,
      phone: emp.phone,
      store: emp.store,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (emp) => {
    setActiveEmployee(emp);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = (emp) => {
    setEmployees(
      employees.map((e) =>
        e.id === emp.id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e
      )
    );
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const newEmp = {
      id: `emp-${Date.now()}`,
      name: formData.name,
      role: formData.role,
      email: formData.email,
      phone: formData.phone || '+91 98000 00000',
      store: formData.store,
      storeId: 'store-01',
      status: 'Active',
      rank: employees.length + 1,
      salesAmount: 120000,
      salesFormatted: '₹1.20L',
      ordersHandled: 150,
      targetAchievement: 100,
      rating: 4.8,
      returnRate: '1.5%',
      performanceScore: 90,
      badge: 'New Hire',
      joinDate: new Date().toISOString().split('T')[0],
      topCategory: 'Retail Operations',
    };

    setEmployees([newEmp, ...employees]);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeEmployee) return;

    setEmployees(
      employees.map((e) =>
        e.id === activeEmployee.id
          ? {
              ...e,
              name: formData.name,
              role: formData.role,
              email: formData.email,
              phone: formData.phone,
              store: formData.store,
            }
          : e
      )
    );
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (activeEmployee) {
      setEmployees(employees.filter((e) => e.id !== activeEmployee.id));
      setIsDeleteDialogOpen(false);
      setActiveEmployee(null);
    }
  };

  const columns = [
    {
      header: 'Seller / Staff',
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
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center flex-shrink-0">
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
      header: 'Assigned Store Outlet',
      accessor: 'store',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.store?.split('(')[0] || 'Indiranagar Flagship'}
        </span>
      ),
    },
    {
      header: 'Monthly Sales',
      accessor: 'salesAmount',
      render: (row) => (
        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">
          {row.salesFormatted || `₹${(row.salesAmount || 0).toLocaleString()}`}
        </span>
      ),
    },
    {
      header: 'Target Quota',
      accessor: 'targetAchievement',
      render: (row) => (
        <Badge variant={row.targetAchievement >= 110 ? 'success' : row.targetAchievement >= 100 ? 'purple' : 'warning'} size="sm">
          {row.targetAchievement}% Achieved
        </Badge>
      ),
    },
    {
      header: 'CSAT Rating',
      accessor: 'rating',
      render: (row) => (
        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400" /> {row.rating || 4.8}
        </span>
      ),
    },
    {
      header: 'Return Rate',
      accessor: 'returnRate',
      render: (row) => <span className="text-xs font-mono text-slate-500">{row.returnRate || '1.2%'}</span>,
    },
    {
      header: 'Performance Score',
      accessor: 'performanceScore',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-black text-xs text-purple-600 dark:text-purple-400">{row.performanceScore || 90}%</span>
        </div>
      ),
    },
    {
      header: t('status'),
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'danger'} size="sm" dot>
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
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'Active' ? 'Deactivate Staff' : 'Activate Staff'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Ban className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Employee"
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
    <div className="space-y-7 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Enterprise Seller & Staff Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-store staff allocation, quota tracking, CSAT ratings, and enterprise star seller leaderboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            Add Seller / Staff
          </Button>
        </div>
      </div>

      {/* ⭐ STAR SELLERS ENTERPRISE LEADERBOARD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200 dark:border-amber-900/50">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                ⭐ Enterprise Star Sellers Leaderboard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top performing sales executives ranked across all retail outlets
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {starSellers.map((seller, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={seller.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  rank === 1
                    ? 'bg-gradient-to-b from-amber-50/80 via-white to-amber-50/20 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border-amber-300 dark:border-amber-900/60 shadow-md ring-1 ring-amber-400'
                    : rank === 2
                    ? 'bg-gradient-to-b from-purple-50/60 to-white dark:from-purple-950/30 dark:to-slate-900 border-purple-200 dark:border-purple-800 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="relative">
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 flex-shrink-0"
                      />
                      <div
                        className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shadow-md ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-white dark:ring-slate-900'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-900 ring-2 ring-white dark:ring-slate-900'
                            : 'bg-amber-700 text-white ring-2 ring-white dark:ring-slate-900'
                        }`}
                      >
                        #{rank}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{seller.topCategory}</span>
                        <Badge variant="purple" size="sm">Score: {seller.performanceScore}%</Badge>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {seller.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Store: <strong>{seller.store?.split('(')[0]}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Sales</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">{seller.salesFormatted}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Quota</span>
                      <span className="font-black text-emerald-600">{seller.targetAchievement}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Rating</span>
                      <span className="font-bold text-amber-500">⭐ {seller.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search staff name, email, store..."
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
            options={['All', ...initialStores.map((s) => s.name)]}
            className="w-44"
          />

          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={['All', ...employeeRoles].map((r) => ({ value: r, label: r === 'All' ? 'All Roles' : r }))}
            className="w-44"
          />
        </div>
      </div>

      {/* Employees Table */}
      <Table
        columns={columns}
        data={paginatedEmployees}
        emptyMessage="No staff records match the selected filter."
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredEmployees.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New Employee"
        subtitle="Provision a new employee record and assign store credentials"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Save Employee
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email"
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={employeeRoles}
            />
            <Select
              label="Assigned Store Outlet"
              value={formData.store}
              onChange={(e) => setFormData({ ...formData, store: e.target.value })}
              options={initialStores.map((s) => s.name)}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee Record"
        subtitle={`Updating: ${activeEmployee?.name}`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={employeeRoles}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Employee"
        message={`Are you sure you want to remove ${activeEmployee?.name}? They will lose access to the RetailMind platform.`}
      />
    </div>
  );
}
