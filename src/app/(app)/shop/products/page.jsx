'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { initialProducts, productCategories } from '@/data/products';
import { ProductCard } from '@/components/customer/ProductCard';
import { ProductIntelligenceModal } from '@/components/intelligence/ProductIntelligenceModal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';

export default function ShopProductsPage() {
  const searchParams = useSearchParams();
  const { t } = useAppSettings();

  const [products] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'rating' | 'discount'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchTerm(q);
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesStock = !inStockOnly || p.stock > 0;

      return matchesSearch && matchesCat && matchesStock;
    });

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.discountPct || 0) - (a.discountPct || 0));
    }

    return list;
  }, [products, searchTerm, selectedCategory, sortBy, inStockOnly]);

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Supermarket Grocery Catalog
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse fresh fruits, vegetables, dairy, bakery, beverages, grains, and pantry goods.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 self-start sm:self-auto border border-emerald-200 dark:border-emerald-800">
          {filteredProducts.length} Fresh Items Found
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              icon={Search}
              placeholder="Search products by name, category, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={productCategories.map((c) => ({ value: c, label: c === 'All' ? 'All Categories' : c }))}
              className="w-44"
            />

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'featured', label: 'Sort: Featured' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'rating', label: 'Customer Rating' },
                { value: 'discount', label: 'Biggest Discount' },
              ]}
              className="w-44"
            />
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Popular:</span>
            {['All', 'Dairy & Eggs', 'Bakery & Snacks', 'Fruits & Vegetables', 'Rice & Grains', 'Beverages'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-0"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 opacity-40" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No products match your filter criteria
          </h4>
          <p className="text-xs text-slate-400">
            Try adjusting your search terms or clearing your category filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSortBy('featured');
              setInStockOnly(false);
            }}
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={() => handleOpenProduct(prod)}
            />
          ))}
        </div>
      )}

      {/* Product Details Modal */}
      <ProductIntelligenceModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}
