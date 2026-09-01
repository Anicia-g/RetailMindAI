'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Store,
  User,
} from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Table } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ProductIntelligenceModal } from '@/components/intelligence/ProductIntelligenceModal';
import { initialProducts, productCategories } from '@/data/products';
import { initialSuppliers } from '@/data/suppliers';
import { initialEmployees } from '@/data/employees';
import { initialStores } from '@/data/stores';

export default function ProductsPage() {
  const { t } = useAppSettings();

  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeller, setSelectedSeller] = useState('All');
  const [selectedStore, setSelectedStore] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);

  const [activeProduct, setActiveProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Dairy & Eggs',
    brand: '',
    unit: 'Tetra',
    price: '',
    costPrice: '',
    tax: '5',
    stock: '',
    reorderLevel: '30',
    supplier: 'Valley Harvest Goods',
    seller: 'Priya Sharma',
    store: 'Indiranagar Flagship (Store 01)',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Unique list of sellers and stores for filters
  const sellerOptions = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.seller).filter(Boolean)));
    return ['All', ...list];
  }, [products]);

  const storeOptions = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.store).filter(Boolean)));
    return ['All', ...list];
  }, [products]);

  // Filtered & Paginated Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.seller?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSeller = selectedSeller === 'All' || p.seller === selectedSeller;
      const matchesStore = selectedStore === 'All' || p.store === selectedStore;
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Low Stock' && p.stock <= p.reorderLevel) ||
        (selectedStatus === 'Healthy' && p.stock > p.reorderLevel) ||
        p.stockStatus === selectedStatus;

      return matchesSearch && matchesCategory && matchesSeller && matchesStore && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedSeller, selectedStore, selectedStatus]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Dairy & Eggs',
      brand: 'OrganicMart',
      unit: 'Pcs',
      price: '',
      costPrice: '',
      tax: '5',
      stock: '',
      reorderLevel: '30',
      supplier: 'Valley Harvest Goods',
      seller: 'Priya Sharma',
      store: 'Indiranagar Flagship (Store 01)',
      status: 'Active',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setActiveProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      brand: prod.brand || '',
      unit: prod.unit || 'Pcs',
      price: String(prod.price),
      costPrice: String(prod.costPrice),
      tax: String(prod.tax || 5),
      stock: String(prod.stock),
      reorderLevel: String(prod.reorderLevel),
      supplier: prod.supplier,
      seller: prod.seller || 'Priya Sharma',
      store: prod.store || 'Indiranagar Flagship (Store 01)',
      status: prod.status || 'Active',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (prod) => {
    setActiveProduct(prod);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenIntelligence = (prod) => {
    setActiveProduct(prod);
    setIsIntelligenceOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.sku.trim()) errs.sku = 'SKU is required';
    if (!formData.price || Number(formData.price) <= 0) errs.price = 'Valid price required';
    if (!formData.costPrice || Number(formData.costPrice) <= 0) errs.costPrice = 'Valid cost price required';
    if (formData.stock === '' || Number(formData.stock) < 0) errs.stock = 'Stock must be 0 or more';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newProd = {
      id: `prod-${Date.now()}`,
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      brand: formData.brand || 'RetailBrand',
      unit: formData.unit,
      price: Number(formData.price),
      costPrice: Number(formData.costPrice),
      tax: Number(formData.tax),
      stock: Number(formData.stock),
      reorderLevel: Number(formData.reorderLevel),
      supplier: formData.supplier,
      supplierId: 'sup-001',
      seller: formData.seller,
      store: formData.store,
      status: formData.status,
      stockStatus: Number(formData.stock) <= Number(formData.reorderLevel) ? 'Low Stock' : 'Healthy',
      dailyVelocity: (Math.random() * 4 + 1).toFixed(1),
      velocityChange: '+10%',
      stockoutRisk: Number(formData.stock) <= Number(formData.reorderLevel) ? 75 : 15,
      expectedStockoutDays: Math.max(2, Math.round(Number(formData.stock) / 3)),
      suggestedReorder: Number(formData.reorderLevel) * 2,
    };

    setProducts([newProd, ...products]);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setProducts(
      products.map((p) => {
        if (p.id === activeProduct.id) {
          const numStock = Number(formData.stock);
          const numReorder = Number(formData.reorderLevel);
          return {
            ...p,
            name: formData.name,
            sku: formData.sku,
            category: formData.category,
            brand: formData.brand,
            unit: formData.unit,
            price: Number(formData.price),
            costPrice: Number(formData.costPrice),
            tax: Number(formData.tax),
            stock: numStock,
            reorderLevel: numReorder,
            supplier: formData.supplier,
            seller: formData.seller,
            store: formData.store,
            status: formData.status,
            stockStatus: numStock <= numReorder ? 'Low Stock' : 'Healthy',
          };
        }
        return p;
      })
    );
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (activeProduct) {
      setProducts(products.filter((p) => p.id !== activeProduct.id));
      setIsDeleteDialogOpen(false);
      setActiveProduct(null);
    }
  };

  const handleCreatePOFromModal = (prod) => {
    window.dispatchEvent(new CustomEvent('open-po-modal', { detail: prod }));
  };

  const columns = [
    {
      header: t('product'),
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-2xs">
            <img
              src={row.image}
              alt={row.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
              <span>{row.name}</span>
              {row.stockoutRisk >= 75 && (
                <span title="High Stockout Risk" className="text-rose-500 flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 inline" />
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {row.brand} • {row.unit}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: t('sku'),
      accessor: 'sku',
      render: (row) => <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{row.sku}</span>,
    },
    {
      header: t('category'),
      accessor: 'category',
      render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.category}</span>,
    },
    {
      header: t('seller'),
      accessor: 'seller',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[9px] font-bold flex items-center justify-center">
            {row.seller?.slice(0, 2).toUpperCase() || 'SE'}
          </div>
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">{row.seller || 'Priya Sharma'}</span>
        </div>
      ),
    },
    {
      header: t('storeLocation'),
      accessor: 'store',
      render: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {row.store?.split('(')[0] || 'Indiranagar Flagship'}
        </span>
      ),
    },
    {
      header: t('sellingPrice'),
      accessor: 'price',
      render: (row) => (
        <div>
          <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">₹{row.price.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400">Cost: ₹{row.costPrice}</div>
        </div>
      ),
    },
    {
      header: t('currentStock'),
      accessor: 'stock',
      render: (row) => {
        const isLow = row.stock <= row.reorderLevel;
        return (
          <div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className={isLow ? 'text-rose-600 dark:text-rose-400 text-xs' : 'text-slate-900 dark:text-slate-100 text-xs'}>
                {row.stock} {row.unit}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Min: {row.reorderLevel}</div>
          </div>
        );
      },
    },
    {
      header: t('stockStatus'),
      accessor: 'stockStatus',
      render: (row) => {
        const isLow = row.stock <= row.reorderLevel;
        return (
          <Badge variant={isLow ? 'danger' : 'success'} size="sm" dot>
            {isLow ? t('lowStock') : t('healthyStock')}
          </Badge>
        );
      },
    },
    {
      header: t('actions'),
      accessor: 'actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenIntelligence(row)}
            title="AI Product Intelligence & Forecast"
            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Product"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            title="Delete Product"
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('productCatalog')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-store SKU inventory, seller assignments, unit economics, and multi-horizon demand forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            {t('addProduct')}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar with Seller & Store Filters */}
      <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search SKU, product name, brand, or seller..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
            <Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              options={productCategories.map((c) => ({ value: c, label: c === 'All' ? 'All Categories' : c }))}
              className="w-36"
            />

            <Select
              value={selectedSeller}
              onChange={(e) => {
                setSelectedSeller(e.target.value);
                setCurrentPage(1);
              }}
              options={sellerOptions.map((s) => ({ value: s, label: s === 'All' ? 'All Sellers' : s }))}
              className="w-36"
            />

            <Select
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setCurrentPage(1);
              }}
              options={storeOptions.map((st) => ({ value: st, label: st === 'All' ? 'All Stores' : st.split('(')[0] }))}
              className="w-40"
            />

            <Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'All', label: 'All Stock Status' },
                { value: 'Healthy', label: 'Healthy Stock' },
                { value: 'Low Stock', label: 'Low / Critical Stock' },
                { value: 'Overstock', label: 'Overstock Buffer' },
              ]}
              className="w-36"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <Table
        columns={columns}
        data={paginatedProducts}
        emptyMessage="No products match the selected filters."
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product SKU"
        subtitle="Create a new SKU record with seller and store allocation"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Save SKU
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
            <Input
              label="SKU Code"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              error={formErrors.sku}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={productCategories.filter((c) => c !== 'All')}
            />
            <Input
              label="Brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
            <Input
              label="Unit (Tetra / Kg / Pcs)"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assigned Seller"
              value={formData.seller}
              onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
              options={initialEmployees.map((e) => e.name)}
            />
            <Select
              label="Store Location"
              value={formData.store}
              onChange={(e) => setFormData({ ...formData, store: e.target.value })}
              options={initialStores.map((s) => `${s.name} (${s.code})`)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Selling Price (₹)"
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              error={formErrors.price}
            />
            <Input
              label="Cost Price (₹)"
              type="number"
              required
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              error={formErrors.costPrice}
            />
            <Input
              label="Stock Quantity"
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              error={formErrors.stock}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product SKU"
        subtitle={`Updating SKU: ${activeProduct?.sku}`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
            <Input
              label="SKU Code"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              error={formErrors.sku}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={productCategories.filter((c) => c !== 'All')}
            />
            <Select
              label="Assigned Seller"
              value={formData.seller}
              onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
              options={initialEmployees.map((e) => e.name)}
            />
            <Select
              label="Store Location"
              value={formData.store}
              onChange={(e) => setFormData({ ...formData, store: e.target.value })}
              options={initialStores.map((s) => `${s.name} (${s.code})`)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Selling Price (₹)"
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              error={formErrors.price}
            />
            <Input
              label="Cost Price (₹)"
              type="number"
              required
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              error={formErrors.costPrice}
            />
            <Input
              label="Stock Quantity"
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              error={formErrors.stock}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product SKU"
        message={`Are you sure you want to remove ${activeProduct?.name} (${activeProduct?.sku}) from the catalog? This will remove inventory tracking.`}
        confirmLabel="Delete Product"
      />

      {/* Product Intelligence Modal */}
      <ProductIntelligenceModal
        product={activeProduct}
        isOpen={isIntelligenceOpen}
        onClose={() => {
          setIsIntelligenceOpen(false);
          setActiveProduct(null);
        }}
        onCreatePO={handleCreatePOFromModal}
      />
    </div>
  );
}
