'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, ShoppingBag, Search, Filter, Flame, Star, Tag, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { SupermarketHero } from '@/components/customer/SupermarketHero';
import { CategoryList } from '@/components/customer/CategoryList';
import { DealsSection } from '@/components/customer/DealsSection';
import { FrequentlyBoughtTogether } from '@/components/customer/FrequentlyBoughtTogether';
import { ProductCard } from '@/components/customer/ProductCard';
import { ProductIntelligenceModal } from '@/components/intelligence/ProductIntelligenceModal';
import { initialProducts } from '@/data/products';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export default function SupermarketShopPage() {
  const router = useRouter();
  const { cartItemCount } = useAuth();
  const { t } = useAppSettings();

  const [products] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTab, setSelectedTab] = useState('all'); // 'all' | 'recommended' | 'trending' | 'bestsellers'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

      if (selectedTab === 'recommended') {
        return matchesSearch && matchesCat && (p.rating >= 4.8 || (p.discountPct && p.discountPct >= 10));
      }
      if (selectedTab === 'trending') {
        return matchesSearch && matchesCat && (p.dailyVelocity >= 5 || p.velocityChange?.startsWith('+'));
      }
      if (selectedTab === 'bestsellers') {
        return matchesSearch && matchesCat && ((p.unitsSold || 0) >= 200);
      }

      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategory, selectedTab]);

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleScrollToDeals = () => {
    const dealsElem = document.getElementById('supermarket-deals');
    if (dealsElem) {
      dealsElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/shop/offers');
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Supermarket Promotional Hero */}
      <SupermarketHero onExploreDeals={handleScrollToDeals} />

      {/* Category Visual Grid */}
      <CategoryList
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Today's Best Deals Section */}
      <div id="supermarket-deals">
        <DealsSection products={products} />
      </div>

      {/* Frequently Bought Together AI Bundles */}
      <FrequentlyBoughtTogether />

      {/* Main Supermarket Product Catalog / Recommendation Grid */}
      <div className="space-y-5 pt-2">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              🛍️ Supermarket Aisles
              <span className="text-xs text-slate-400 font-normal">
                ({filteredProducts.length} items found)
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fresh quality groceries, dairy essentials, pantry staples, and curated snacks
            </p>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start md:self-auto overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All Products', icon: null },
              { id: 'recommended', label: 'Recommended For You', icon: Sparkles },
              { id: 'trending', label: '🔥 Trending', icon: Flame },
              { id: 'bestsellers', label: '⭐ Best Sellers', icon: Star },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    selectedTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              icon={Search}
              placeholder="Search milk, bread, rice, coffee, snacks, fruits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {selectedCategory !== 'All' && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="hover:text-rose-500 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 opacity-40" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No groceries found matching your search
            </h4>
            <p className="text-xs text-slate-400">
              Try searching with another grocery keyword or clearing your category filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedTab('all');
              }}
            >
              Reset Filters
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
      </div>

      {/* Product Quick View Modal */}
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
