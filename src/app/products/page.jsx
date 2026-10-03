'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { getProducts, getCategories, getSellers } from '@/lib/api';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Store, 
  X, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Tag, 
  ChevronRight,
  PackageCheck,
  CheckCircle2,
  Filter
} from 'lucide-react';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isBangla } = useThemeLanguage();

  // URL Params State
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialSeller = searchParams.get('seller') || 'all';

  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedSeller, setSelectedSeller] = useState(initialSeller);
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync URL search params when category changes externally
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const s = searchParams.get('search') || '';
    const sel = searchParams.get('seller') || 'all';
    setSelectedCategory(cat);
    setSearchQuery(s);
    setDebouncedSearch(s);
    setSelectedSeller(sel);
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load Categories and Sellers once
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, sRes] = await Promise.all([getCategories(), getSellers()]);
        setCategories(cRes?.data || []);

        const rawSellers = sRes?.data || [];
        setSellers(rawSellers);
      } catch (err) {
        console.error('Failed to load categories/sellers:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch Products based on all active filters
  useEffect(() => {
    async function fetchFilteredProducts() {
      setLoading(true);
      try {
        const params = {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: debouncedSearch.trim() || undefined,
          sellerId: selectedSeller !== 'all' ? selectedSeller : undefined,
          sort: sortBy,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          inStock: inStockOnly ? 'true' : undefined,
          featured: featuredOnly ? 'true' : undefined,
          bestSeller: bestSellerOnly ? 'true' : undefined,
          limit: 100
        };

        const res = await getProducts(params);
        let prods = res?.data || [];

        // Client-side fallback filtering in case backend returns unfiltered
        if (selectedSeller !== 'all') {
          prods = prods.filter(p => {
            const sName = p.seller_name || p.sellerName || p.shop_name || p.seller?.shop_name || '';
            return sName.toLowerCase().trim() === selectedSeller.toLowerCase().trim();
          });
        }

        if (minPrice && !isNaN(Number(minPrice))) {
          prods = prods.filter(p => (p.price || 0) >= Number(minPrice));
        }
        if (maxPrice && !isNaN(Number(maxPrice))) {
          prods = prods.filter(p => (p.price || 0) <= Number(maxPrice));
        }
        if (inStockOnly) {
          prods = prods.filter(p => (p.stock > 0 || p.stock_quantity > 0));
        }
        if (featuredOnly) {
          prods = prods.filter(p => p.isFeatured || p.is_featured);
        }
        if (bestSellerOnly) {
          prods = prods.filter(p => p.isBestSeller || p.is_bestseller);
        }

        setProducts(prods);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredProducts();
  }, [
    selectedCategory,
    debouncedSearch,
    selectedSeller,
    sortBy,
    minPrice,
    maxPrice,
    inStockOnly,
    featuredOnly,
    bestSellerOnly
  ]);

  // Default Categories List for Fallback
  const defaultCategoryList = useMemo(() => [
    { id: 'all', name: 'সকল পণ্য', nameEn: 'All Products', slug: 'all', icon: '🛒' },
    { id: 1, name: 'খাঁটি মধু', nameEn: 'Pure Honey', slug: 'pure-honey', icon: '🍯' },
    { id: 2, name: 'সরিষার তেল', nameEn: 'Mustard Oil', slug: 'mustard-oil', icon: '🛢️' },
    { id: 3, name: 'খাঁটি গাওয়া ঘি', nameEn: 'Pure Cow Ghee', slug: 'pure-ghee', icon: '🧈' },
    { id: 4, name: 'খেজুর ও বাদাম', nameEn: 'Dates & Nuts', slug: 'dates-nuts', icon: '🥜' },
    { id: 5, name: 'অর্গানিক মসলা', nameEn: 'Organic Spices', slug: 'organic-spices', icon: '🌶️' },
    { id: 6, name: 'স্বাস্থ্যকর চাল ও ডাল', nameEn: 'Healthy Rice & Grains', slug: 'rice-grains', icon: '🌾' },
  ], []);

  const allCategoriesList = useMemo(() => {
    if (!categories || categories.length === 0) return defaultCategoryList;
    const items = [{ id: 'all', name: 'সকল পণ্য', nameEn: 'All Products', slug: 'all', icon: '🛒' }];
    categories.forEach(c => {
      items.push({
        id: c.id || c._id || c.slug,
        name: c.name || c.name_bn,
        nameEn: c.name_en || c.nameEn || c.name,
        slug: c.slug || c.categorySlug || String(c.id),
        icon: c.icon || '🌿'
      });
    });
    return items;
  }, [categories, defaultCategoryList]);

  // Category Selector Handler
  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug);
    const newParams = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    router.push(`/products${newParams.toString() ? `?${newParams.toString()}` : ''}`, { scroll: false });
    setIsMobileFilterOpen(false);
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedSeller('all');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setFeaturedOnly(false);
    setBestSellerOnly(false);
    router.push('/products', { scroll: false });
  };

  const isAnyFilterActive = 
    selectedCategory !== 'all' || 
    debouncedSearch !== '' || 
    selectedSeller !== 'all' || 
    minPrice !== '' || 
    maxPrice !== '' || 
    inStockOnly || 
    featuredOnly || 
    bestSellerOnly;

  // Selected Category Info
  const activeCategoryObj = allCategoriesList.find(c => c.slug === selectedCategory) || allCategoriesList[0];

  return (
    <div className="min-h-screen bg-[#f8faf8] dark:bg-[#0a150e] text-gray-900 dark:text-emerald-50 transition-colors pb-20">
      
      {/* Top Banner / Breadcrumb Area */}
      <div className="bg-gradient-to-r from-brand-950 via-emerald-950 to-brand-900 text-white border-b border-emerald-900/60 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-300/80 mb-1.5 font-semibold">
              <span>{isBangla ? 'হোম' : 'Home'}</span>
              <span>/</span>
              <span className="text-white font-bold">{isBangla ? 'সকল পণ্য' : 'All Products'}</span>
              {selectedCategory !== 'all' && (
                <>
                  <span>/</span>
                  <span className="text-amber-300 font-bold">{isBangla ? activeCategoryObj.name : activeCategoryObj.nameEn}</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black flex items-center gap-2.5">
              <span>{activeCategoryObj.icon}</span>
              <span>
                {selectedCategory === 'all' 
                  ? (isBangla ? 'ইহসান অনলাইন শপ - সকল খাঁটি পণ্য' : 'Ihsan Online Shop - All Pure Products') 
                  : (isBangla ? activeCategoryObj.name : activeCategoryObj.nameEn)}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-xl">
              {isBangla 
                ? 'শতভাগ বিশুদ্ধ ও স্বাস্থ্যকর খাদ্যপণ্য সরাসরি বিশ্বস্ত উৎস থেকে আপনার দ্বারে পৌঁছে দিতে আমরা বদ্ধপরিকর।' 
                : 'Premium quality, 100% pure & organic essentials delivered directly to your doorstep.'}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs">
              <span className="text-emerald-300 block font-semibold">{isBangla ? 'উপলব্ধ পণ্য' : 'Total Items'}</span>
              <span className="text-base font-black text-white">{products.length} {isBangla ? 'টি' : 'Products'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Left Sidebar (Categories & Filters) + Right Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        
        {/* Mobile Filter & Search Toggle Bar */}
        <div className="lg:hidden flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isBangla ? 'পণ্য খুঁজুন (মধু, ঘি, তেল...)' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-[#112318] border border-gray-300 dark:border-emerald-900/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-900"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-900 dark:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md flex-shrink-0"
          >
            <Filter className="w-4 h-4" />
            <span>{isBangla ? 'ক্যাটাগরি ও ফিল্টার' : 'Filters'}</span>
            {isAnyFilterActive && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ======================================================== */}
          {/* 👈 LEFT SIDEBAR: ALL CATEGORIES & MULTI-FILTER PANEL */}
          {/* ======================================================== */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-80 lg:w-full lg:col-span-4 xl:col-span-3
              bg-white dark:bg-[#112318] lg:bg-transparent lg:dark:bg-transparent
              p-5 lg:p-0 border-r lg:border-r-0 border-gray-200 dark:border-emerald-900/60
              overflow-y-auto lg:overflow-visible transition-transform duration-300 ease-in-out
              ${isMobileFilterOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="space-y-6">
              
              {/* Mobile Drawer Header */}
              <div className="flex lg:hidden items-center justify-between border-b pb-3 border-gray-200 dark:border-emerald-900/60">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-900 dark:text-emerald-400" />
                  <h3 className="font-black text-sm text-gray-900 dark:text-emerald-50">
                    {isBangla ? 'ক্যাটাগরি ও ফিল্টার' : 'Filter Products'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-emerald-950"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. 🏷️ CATEGORIES LIST CARD */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-5 border border-gray-200/80 dark:border-[#1d3b28] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-emerald-950 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 rounded-xl">
                      <Layers className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-emerald-50">
                      {isBangla ? 'ক্যাটাগরি সমূহ' : 'All Categories'}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">
                    {allCategoriesList.length - 1} {isBangla ? 'টি' : 'Types'}
                  </span>
                </div>

                {/* Categories Navigation Links */}
                <div className="space-y-1.5">
                  {allCategoriesList.map((cat) => {
                    const isActive = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.id || cat.slug}
                        onClick={() => handleSelectCategory(cat.slug)}
                        className={`
                          w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left
                          ${isActive 
                            ? 'bg-gradient-to-r from-brand-900 via-emerald-800 to-teal-800 text-white shadow-md shadow-brand-950/20 font-black' 
                            : 'text-gray-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-brand-900'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-base flex-shrink-0">{cat.icon}</span>
                          <span className="truncate">{isBangla ? cat.name : cat.nameEn}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isActive ? 'rotate-90 text-amber-300' : 'text-gray-400'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. 🏪 SELLER FILTER CARD */}
              {sellers && sellers.length > 0 && (
                <div className="bg-white dark:bg-[#112318] rounded-3xl p-5 border border-gray-200/80 dark:border-[#1d3b28] shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-gray-100 dark:border-emerald-950 pb-3">
                    <span className="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl">
                      <Store className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-emerald-50">
                      {isBangla ? 'সেলার ও ভেন্ডর' : 'Sellers & Vendors'}
                    </h3>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => setSelectedSeller('all')}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                        selectedSeller === 'all'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 font-extrabold border border-amber-300 dark:border-amber-800'
                          : 'text-gray-600 dark:text-emerald-300 hover:bg-gray-50 dark:hover:bg-black/30'
                      }`}
                    >
                      <span>{isBangla ? 'সকল সেলার (All Sellers)' : 'All Sellers'}</span>
                      {selectedSeller === 'all' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>

                    {sellers.map((s) => {
                      const sName = s.shop_name || s.name || s.seller_name;
                      const isSel = selectedSeller === sName;
                      return (
                        <button
                          key={s.id || s._id || sName}
                          onClick={() => setSelectedSeller(sName)}
                          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                            isSel
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 font-extrabold border border-amber-300 dark:border-amber-800'
                              : 'text-gray-600 dark:text-emerald-300 hover:bg-gray-50 dark:hover:bg-black/30'
                          }`}
                        >
                          <span className="truncate">🏪 {sName}</span>
                          {isSel && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. 💰 PRICE RANGE FILTER */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-5 border border-gray-200/80 dark:border-[#1d3b28] shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-emerald-950 pb-3">
                  <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 rounded-xl">
                    <Tag className="w-4 h-4" />
                  </span>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-emerald-50">
                    {isBangla ? 'মূল্য সীমা (টাকা)' : 'Price Range (BDT)'}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
                      {isBangla ? 'সর্বনিম্ন' : 'Min (৳)'}
                    </label>
                    <input
                      type="number"
                      placeholder="০"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-xl text-xs font-bold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
                      {isBangla ? 'সর্বোচ্চ' : 'Max (৳)'}
                    </label>
                    <input
                      type="number"
                      placeholder="৫০০০"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-xl text-xs font-bold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                    />
                  </div>
                </div>
              </div>

              {/* 4. ⚡ QUICK FLAGS (In Stock, Best Seller, Featured) */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-5 border border-gray-200/80 dark:border-[#1d3b28] shadow-sm space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-emerald-950 pb-2">
                  {isBangla ? 'অন্যান্য ফিল্টার' : 'Availability & Flags'}
                </h4>

                <label className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-900 focus:ring-brand-900 accent-brand-900 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-emerald-200">
                    {isBangla ? 'শুধুমাত্র স্টকে থাকা পণ্য' : 'In Stock Only'}
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={bestSellerOnly}
                    onChange={(e) => setBestSellerOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-900 focus:ring-brand-900 accent-brand-900 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-emerald-200 flex items-center gap-1.5">
                    <span>🔥</span>
                    <span>{isBangla ? 'বেস্ট সেলার পণ্য' : 'Best Sellers'}</span>
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-900 focus:ring-brand-900 accent-brand-900 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-emerald-200 flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>{isBangla ? 'ফিচার্ড স্পেশাল' : 'Featured Items'}</span>
                  </span>
                </label>
              </div>

              {/* 5. 🔄 RESET ALL FILTERS BUTTON */}
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-3 px-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 font-black text-xs rounded-2xl border border-red-200 dark:border-red-900/50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'সকল ফিল্টার রিসেট করুন' : 'Reset All Filters'}</span>
                </button>
              )}

            </div>
          </aside>

          {/* Backdrop for Mobile Drawer */}
          {isMobileFilterOpen && (
            <div
              onClick={() => setIsMobileFilterOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />
          )}

          {/* ======================================================== */}
          {/* 👉 RIGHT CONTENT: PROMINENT SEARCH + SORT TOOLBAR + GRID */}
          {/* ======================================================== */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* 🔍 PROMINENT SEARCH BAR (Desktop & Responsive) */}
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-[#1d3b28] shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input Box */}
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-900 dark:text-emerald-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder={
                      isBangla 
                        ? 'খাঁটি মধু, সরিষার তেল, ঘি, খেজুর, মসলা বা পণ্য খুঁজুন...' 
                        : 'Search honey, ghee, mustard oil, dates, spices...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3.5 bg-[#f8faf8] dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-semibold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900 focus:bg-white dark:focus:bg-black/60 transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-emerald-200 rounded-xl"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-2 bg-[#f8faf8] dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl px-4 py-2.5 sm:w-56 flex-shrink-0 shadow-inner">
                  <ArrowUpDown className="w-4 h-4 text-brand-900 dark:text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-gray-400 block font-bold leading-tight">{isBangla ? 'সাজান' : 'Sort by'}</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent font-black text-xs text-gray-900 dark:text-emerald-100 focus:outline-none cursor-pointer w-full"
                    >
                      <option value="newest">{isBangla ? 'সর্বশেষ পণ্য' : 'Newest'}</option>
                      <option value="price_asc">{isBangla ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High'}</option>
                      <option value="price_desc">{isBangla ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low'}</option>
                      <option value="rating">{isBangla ? 'সেরা রেটিং' : 'Top Rated'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Badges */}
              {isAnyFilterActive && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-emerald-950 text-xs">
                  <span className="text-gray-400 text-[11px] font-bold">{isBangla ? 'সক্রিয় ফিল্টার:' : 'Active:'}</span>
                  
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 border border-brand-200 dark:border-emerald-800 font-black">
                      <span>{activeCategoryObj.icon}</span>
                      <span>{isBangla ? activeCategoryObj.name : activeCategoryObj.nameEn}</span>
                      <button onClick={() => handleSelectCategory('all')} className="hover:text-red-500 ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {debouncedSearch && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold">
                      <span>🔍 "{debouncedSearch}"</span>
                      <button onClick={() => setSearchQuery('')} className="hover:text-red-500 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedSeller !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">
                      <span>🏪 {selectedSeller}</span>
                      <button onClick={() => setSelectedSeller('all')} className="hover:text-red-500 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold">
                      <span>৳ {minPrice || '০'} - {maxPrice || '∞'}</span>
                      <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-500 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                      <span>✓ In Stock</span>
                      <button onClick={() => setInStockOnly(false)} className="hover:text-red-500 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-black text-red-600 dark:text-red-400 hover:underline ml-auto"
                  >
                    {isBangla ? 'সব মুছুন' : 'Clear All'}
                  </button>
                </div>
              )}
            </div>

            {/* 📦 PRODUCTS GRID OR EMPTY STATE */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-[#112318] rounded-3xl p-4 border border-gray-100 dark:border-emerald-900 shadow-sm animate-pulse space-y-3">
                    <div className="bg-gray-200 dark:bg-gray-800 aspect-square rounded-2xl"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm border border-gray-200/80 dark:border-[#1d3b28] space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  🔍
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-emerald-50">
                    {isBangla ? 'কোনো পণ্য পাওয়া যায়নি!' : 'No Products Found!'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400/80 mt-1.5 leading-relaxed">
                    {isBangla 
                      ? 'আপনার প্রদত্ত ক্যাটাগরি, কি-ওয়ার্ড বা ফিল্টারের সাথে কোনো পণ্য মেলেনি। ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।' 
                      : 'No products match your active search filters or category. Try clearing filters.'}
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-gradient-to-r from-brand-900 to-emerald-800 text-white font-black text-xs rounded-2xl shadow-lg hover:from-brand-800 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'সকল পণ্য দেখুন (রিসেট)' : 'Show All Products'}</span>
                </button>
              </div>
            )}

          </main>

        </div>

      </div>

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">পণ্যসমূহ লোড হচ্ছে...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
