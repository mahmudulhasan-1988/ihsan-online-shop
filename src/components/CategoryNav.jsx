'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

function CategoryNavInner({ categories = [] }) {
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
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

