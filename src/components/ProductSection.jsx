'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function ProductSection({ 
  title, 
  titleEn, 
  subtitle, 
  subtitleEn, 
  products = [], 
  viewAllLink = '/products', 
  badge = '', 
  badgeEn = '' 
}) {
  const { isBangla, t } = useThemeLanguage();

  if (!products || products.length === 0) return null;

  const displayTitle = isBangla ? title : (titleEn || title);
  const displaySubtitle = isBangla ? subtitle : (subtitleEn || subtitle);
  const displayBadge = isBangla ? badge : (badgeEn || badge);

  return (
    <section className="max-w-7xl mx-auto px-4 my-8 sm:my-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-[#e5eee6] dark:border-[#1c3826]">
        <div>
          {displayBadge && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-900 dark:text-emerald-300 bg-emerald-100/80 dark:bg-[#183925] px-3 py-0.5 rounded-full mb-2 border border-emerald-200/60 dark:border-[#254b32]">
              <Sparkles className="w-3 h-3 text-secondary" />
              {displayBadge}
            </span>
          )}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {displayTitle}
          </h2>
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{displaySubtitle}</p>
          )}
        </div>

        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-900 via-emerald-800 to-teal-800 hover:from-brand-800 hover:to-teal-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md shadow-brand-950/15 transition-all transform active:scale-95 group flex-shrink-0"
          >
            <span>{isBangla ? 'সকল পণ্য পেজে যান (Go to All Products)' : 'Go to All Products Page'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

