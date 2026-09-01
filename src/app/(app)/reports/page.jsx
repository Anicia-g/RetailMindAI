'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  FileText,
  TrendingUp,
  Package,
  Users,
  Truck
} from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Input } from '@/components/common/Input';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { initialSales } from '@/data/sales';
import { initialInventory } from '@/data/inventory';
import { initialCustomers } from '@/data/customers';
import { initialSuppliers } from '@/data/suppliers';

export default function ReportsPage() {
  const { t } = useAppSettings();

  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('2024-08-01');
  const [endDate, setEndDate] = useState('2024-08-31');
  const [exportedToast, setExportedToast] = useState(false);

  const handleExport = () => {
    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 3000);
  };

  const getReportData = () => {
    switch (reportType) {
      case 'sales':
        return {
          title: 'Sales & Revenue Transaction Report',
          columns: [
            { header: 'Order ID', accessor: 'id' },
            { header: 'Customer', accessor: 'customerName' },
            { header: 'Outlet Store', accessor: 'store' },
            { header: 'Payment Method', accessor: 'paymentMethod' },
            {
              header: 'Amount',
              accessor: 'totalAmount',
              render: (r) => `₹${r.totalAmount.toLocaleString()}`,
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (r) => <Badge variant="success" size="sm">{r.status}</Badge>,
            },
          ],
          data: initialSales,
        };
      case 'inventory':
        return {
          title: 'Inventory Risk & Stock Depletion Report',
          columns: [
            { header: 'SKU', accessor: 'sku' },
            { header: 'Product Name', accessor: 'productName' },
            { header: 'Stock Level', accessor: 'currentStock' },
            { header: 'Depletion Days', accessor: 'daysRemaining' },
            {
              header: 'Stockout Risk',
              accessor: 'stockoutProbability',
              render: (r) => `${r.stockoutProbability}%`,
            },
            {
              header: 'Health Status',
              accessor: 'status',
              render: (r) => (
                <Badge variant={r.status === 'Critical' ? 'danger' : r.status === 'Low Stock' ? 'warning' : 'success'} size="sm">
                  {r.status}
                </Badge>
              ),
            },
          ],
          data: initialInventory,
        };
      case 'customers':
        return {
          title: 'Customer RFM Segmentation Report',
          columns: [
            { header: 'Customer Name', accessor: 'name' },
            { header: 'Email', accessor: 'email' },
            { header: 'Orders', accessor: 'orders' },
            {
              header: 'Total Spent',
              accessor: 'totalSpent',
              render: (r) => `₹${r.totalSpent.toLocaleString()}`,
            },
            {
              header: 'RFM Cluster',
              accessor: 'segment',
              render: (r) => <Badge variant="purple" size="sm">{r.segment}</Badge>,
            },
          ],
          data: initialCustomers,
        };
      case 'suppliers':
        return {
          title: 'Vendor SLA & Lead Time Compliance Report',
          columns: [
            { header: 'Supplier Name', accessor: 'name' },
            { header: 'Category', accessor: 'category' },
            { header: 'Lead Time (Days)', accessor: 'leadTimeDays' },
            { header: 'On-Time Score', accessor: 'reliabilityScore' },
            {
              header: 'Rating',
              accessor: 'rating',
              render: (r) => `${r.rating} / 5.0 ★`,
            },
          ],
          data: initialSuppliers,
        };
      default:
        return { title: 'Report', columns: [], data: [] };
    }
  };

  const activeReport = getReportData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('reportsCenter')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate and export financial, operational, and customer segment audit reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" icon={Printer} onClick={() => window.print()}>
            {t('print')}
          </Button>
          <Button variant="primary" size="md" icon={Download} onClick={handleExport}>
            {t('export')}
          </Button>
        </div>
      </div>

      {exportedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Report successfully compiled and ready for CSV download!</span>
        </div>
      )}

      {/* Report Type Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'sales', label: 'Sales & Invoices', icon: TrendingUp },
          { id: 'inventory', label: 'Inventory & Risk', icon: Package },
          { id: 'customers', label: 'Customer RFM', icon: Users },
          { id: 'suppliers', label: 'Supplier SLAs', icon: Truck },
        ].map((rep) => {
          const Icon = rep.icon;
          const isSelected = reportType === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => setReportType(rep.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center gap-3 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{rep.label}</div>
                <span className="text-[10px] text-slate-400">Compiled monthly</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Date & Filter Configuration Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Button variant="primary" size="md" icon={Download} onClick={handleExport} className="w-full sm:w-auto">
          Compile & Export CSV
        </Button>
      </div>

      {/* Preview Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
            {activeReport.title}
          </h3>
          <span className="text-xs text-slate-400">{activeReport.data.length} records generated</span>
        </div>

        <Table columns={activeReport.columns} data={activeReport.data} />
      </div>
    </div>
  );
}
