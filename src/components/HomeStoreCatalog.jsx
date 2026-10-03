'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';
import { Search, X, Layers, ChevronRight, ArrowUpRight, Sparkles, Filter } from 'lucide-react';

export default function HomeStoreCatalog({ initialProducts = [], categories = [] }) {
  const { isBangla } = useThemeLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Default Fallback Categories
  const defaultCategoryList = useMemo(() => [
    { id: 'all', name: 'সকল পণ্য', nameEn: 'All Products', slug: 'all', icon: '🛒' },
    { id: 1, name: 'খাঁটি মধু', nameEn: 'Pure Honey', slug: 'pure-honey', icon: '🍯' },
    { id: 2, name: 'সরিষার তেল', nameEn: 'Mustard Oil', slug: 'mustard-oil', icon: '🛢️' },
    { id: 3, name: 'খাঁটি গাওয়া ঘি', nameEn: 'Pure Cow Ghee', slug: 'pure-ghee', icon: '🧈' },
    { id: 4, name: 'খেজুর ও বাদাম', nameEn: 'Dates & Nuts', slug: 'dates-nuts', icon: '🥜' },
    { id: 5, name: 'অর্গানিক মসলা', nameEn: 'Organic Spices', slug: 'organic-spices', icon: '🌶️' },
    { id: 6, name: 'স্বাস্থ্যকর চাল ও ডাল', nameEn: 'Healthy Rice & Grains', slug: 'rice-grains', icon: '🌾' },
    { id: 7, name: 'পোশাক ও ফ্যাশন', nameEn: 'Fashion & Clothing', slug: 'fashion', icon: '👗' },
    { id: 8, name: 'বেকরি ও কেক', nameEn: 'Bakery & Cake', slug: 'bakery-cake', icon: '🎂' },
    { id: 9, name: 'কম্পিউটার এক্সেসরিজ', nameEn: 'Computer Accessories', slug: 'computer-accessories', icon: '💻' },
    { id: 10, name: 'মোবাইল এক্সেসরিজ', nameEn: 'Mobile Accessories', slug: 'mobile-accessories', icon: '📱' },
    { id: 11, name: 'ইলেকট্রনিক এক্সেসরিজ', nameEn: 'Electronic Accessories', slug: 'electronic-accessories', icon: '🔌' },
  ], []);

  const allCategories = useMemo(() => {
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

  // Filtered Products based on left category sidebar + top search box
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      if (selectedCategory !== 'all') {
        const matchCat = 
          p.categorySlug === selectedCategory || 
          p.category === selectedCategory || 
          String(p.category_id) === selectedCategory ||
          (p.categorySlug && p.categorySlug.includes(selectedCategory)) ||
          (p.category && p.category.includes(selectedCategory));
        if (!matchCat) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = 
          (p.name || '').toLowerCase().includes(q) || 
          (p.name_bn || '').toLowerCase().includes(q) || 
          (p.name_en || '').toLowerCase().includes(q) || 
          (p.category || '').toLowerCase().includes(q);
        if (!matchName) return false;
      }
      return true;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  const activeCategoryObj = allCategories.find(c => c.slug === selectedCategory) || allCategories[0];

  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main 2-Column Grid: Left Sidebar (Categories) + Right Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ======================================================== */}
          {/* 👈 LEFT SIDEBAR: ALL CATEGORIES NAVIGATION               */}
          {/* ======================================================== */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-5 border border-gray-200/80 dark:border-[#1d3b28] shadow-sm sticky top-24 space-y-4">
              
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-emerald-950 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 rounded-xl">
                    <Layers className="w-4 h-4" />
                  </span>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-emerald-50">
                    {isBangla ? 'ক্যাটাগরি সমূহ' : 'All Categories'}
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                  {allCategories.length - 1} {isBangla ? 'টি' : 'Categories'}
                </span>
              </div>

              {/* Category Items List */}
              <div className="space-y-1 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                {allCategories.map((cat) => {
                  const isActive = selectedCategory === cat.slug;
                  const count = cat.slug === 'all' 
                    ? initialProducts.length 
                    : initialProducts.filter(p => p.categorySlug === cat.slug || p.category === cat.name || String(p.category_id) === String(cat.id)).length;

                  return (
                    <button
                      key={cat.id || cat.slug}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`
                        w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left
                        ${isActive 
                          ? 'bg-gradient-to-r from-brand-900 via-emerald-800 to-teal-800 text-white shadow-md shadow-brand-950/20 font-black scale-[1.02]' 
                          : 'text-gray-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-brand-900'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base flex-shrink-0">{cat.icon}</span>
                        <span className="truncate">{isBangla ? cat.name : cat.nameEn}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-black/30 text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* View All Products Page Link */}
              <div className="pt-2 border-t border-gray-100 dark:border-emerald-950">
                <Link
                  href="/products"
                  className="w-full py-2.5 px-3 bg-gray-50 dark:bg-black/30 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-brand-900 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{isBangla ? 'সকল পণ্য পেজে যান' : 'Go to All Products Page'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </aside>

          {/* ======================================================== */}
          {/* 👉 RIGHT AREA: SEARCH BAR + PRODUCTS GRID                 */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* 🔍 PROMINENT SEARCH BAR & TITLE TOOLBAR */}
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-[#1d3b28] shadow-sm space-y-3">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-emerald-950 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeCategoryObj.icon}</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-emerald-50">
                      {selectedCategory === 'all' 
                        ? (isBangla ? 'সকল প্রিমিয়াম খাদ্য ও পণ্যসমূহ' : 'All Products & Essentials') 
                        : (isBangla ? activeCategoryObj.name : activeCategoryObj.nameEn)}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      {isBangla ? `মোট ${filteredProducts.length} টি পণ্য প্রদর্শিত হচ্ছে` : `Showing ${filteredProducts.length} items`}
                    </p>
                  </div>
                </div>

                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="self-start sm:self-auto text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{isBangla ? 'ফিল্টার মুছুন' : 'Clear Filter'}</span>
                  </button>
                )}
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-brand-900 dark:text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isBangla ? 'পণ্য বা ক্যাটাগরি খুঁজুন (মধু, ঘি, সরিষার তেল, খেজুর, পোশাক, টেক এক্সেসরিজ...)' : 'Search honey, ghee, mustard oil, dates, fashion, gadgets...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-[#f8faf8] dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-semibold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-emerald-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

            {/* 📦 PRODUCTS GRID */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm border border-gray-200/80 dark:border-[#1d3b28] space-y-4">
                <div className="text-4xl">🔍</div>
                <h4 className="text-base font-black text-gray-900 dark:text-emerald-50">
                  {isBangla ? 'কোনো পণ্য পাওয়া যায়নি!' : 'No Products Found!'}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {isBangla ? 'আপনার নির্বাচিত ক্যাটাগরি বা কি-ওয়ার্ডে কোনো পণ্য মেলেনি। ক্যাটাগরি পরিবর্তন করুন।' : 'No items match your search. Try another category.'}
                </p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="px-5 py-2.5 bg-brand-900 text-white font-bold text-xs rounded-xl shadow"
                >
                  {isBangla ? 'সকল পণ্য দেখুন' : 'Show All Products'}
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
