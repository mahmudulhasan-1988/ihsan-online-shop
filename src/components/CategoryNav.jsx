'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';
import { Store, ChevronDown } from 'lucide-react';

function CategoryNavInner({ categories = [], sellers = [], selectedSeller = 'all', onSelectSeller }) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const { isBangla } = useThemeLanguage();

  const defaultCategories = [
    { id: 'all', name: 'সকল পণ্য', nameEn: 'All Products', slug: 'all', icon: '🛒' },
    { id: 'honey', name: 'মধু', nameEn: 'Honey', slug: 'honey', icon: '🍯' },
    { id: 'ghee', name: 'ঘি', nameEn: 'Ghee', slug: 'ghee', icon: '🧈' },
    { id: 'oil', name: 'তেল', nameEn: 'Mustard Oil', slug: 'oil', icon: '🫒' },
    { id: 'dates', name: 'খেজুর', nameEn: 'Dates', slug: 'dates', icon: '🌴' },
    { id: 'nuts-seeds', name: 'বীজ ও বাদাম', nameEn: 'Nuts & Seeds', slug: 'nuts-seeds', icon: '🥜' },
    { id: 'spices', name: 'মসলা', nameEn: 'Spices', slug: 'spices', icon: '🌶️' },
    { id: 'tea', name: 'চা ও পানীয়', nameEn: 'Tea & Drinks', slug: 'tea', icon: '🍵' },
  ];

  const displayCategories = categories.length > 0 
    ? [{ id: 'all', name: 'সকল পণ্য', nameEn: 'All Products', slug: 'all', icon: '🛒' }, ...categories] 
    : defaultCategories;

  return (
    <div className="bg-white/95 dark:bg-[#0d1c13]/95 backdrop-blur-md border-b border-[#e7eee8] dark:border-[#1c3927] py-2.5 sm:py-3 shadow-sm sticky top-[62px] sm:top-[74px] z-30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3">
        
        {/* Category Buttons Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar flex-1 min-w-0">
          {displayCategories.map((cat) => {
            const isActive = currentCategory === cat.slug;
            const catName = isBangla ? cat.name : (cat.nameEn || cat.name);
            return (
              <Link
                key={cat.id || cat.slug}
                href={cat.slug === 'all' ? '/products' : `/products?category=${cat.slug}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-800 to-emerald-900 text-white shadow-md shadow-emerald-950/20 scale-105 border border-emerald-600/30'
                    : 'bg-[#f2f7f3] dark:bg-[#14291d] text-brand-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#1a3827] border border-emerald-100 dark:border-[#22442e]'
                }`}
              >
                <span>{cat.icon || '🌿'}</span>
                <span>{catName}</span>
              </Link>
            );
          })}
        </div>

        {/* 🏪 Seller Dropdown Filter Beside Categories */}
        {sellers && sellers.length > 0 && onSelectSeller && (
          <div className="relative flex-shrink-0 pl-2 border-l border-gray-200 dark:border-emerald-900/60">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-[#14291d] border border-amber-300 dark:border-amber-800/80 rounded-2xl px-3 py-1.5 shadow-sm">
              <Store className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <select
                value={selectedSeller}
                onChange={(e) => onSelectSeller(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-950 dark:text-amber-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="all">
                  {isBangla ? 'সকল সেলার (All Sellers)' : 'All Sellers'}
                </option>
                {sellers.map((s) => (
                  <option key={s.id || s.name} value={s.name || s.shop_name}>
                    🏪 {s.shop_name || s.name} ({s.productCount || 0} টি)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CategoryNav(props) {
  return (
    <Suspense fallback={<div className="h-12 bg-white dark:bg-[#0d1c13] border-b border-gray-100 dark:border-[#1c3927]"></div>}>
      <CategoryNavInner {...props} />
    </Suspense>
  );
}
